const express = require("express");
const { body, validationResult } = require("express-validator");
const { supabase } = require("../config/database");
const auth = require("../middleware/auth");

const router = express.Router();

// Validation middleware
const articleValidation = [
  body("title")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Judul artikel harus antara 5-200 karakter"),
  body("content")
    .trim()
    .isLength({ min: 50 })
    .withMessage("Konten artikel minimal 50 karakter"),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Kategori artikel harus diisi"),
];

// @route   GET /api/journal/articles
// @desc    Get all articles with pagination and filters
// @access  Public
router.get("/articles", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("articles")
      .select("*", { count: "exact" })
      .eq("published", true)
      .order("created_at", { ascending: false });

    // Filter by category
    if (category && category !== "Semua") {
      query = query.eq("category", category);
    }

    // Search by title or content
    if (search) {
      query = query.or(`title.ilike.%${search}%, content.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: articles, error, count } = await query;

    if (error) {
      console.error("Get articles error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil artikel",
      });
    }

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Get articles error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/journal/articles/:id
// @desc    Get single article
// @access  Public
router.get("/articles/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: article, error } = await supabase
      .from("articles")
      .select(
        `
        *,
        author:users!articles_author_id_fkey(
          id,
          full_name,
          profile_picture
        )
      `
      )
      .eq("id", id)
      .eq("published", true)
      .single();

    if (error || !article) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan",
      });
    }

    // Increment view count
    await supabase
      .from("articles")
      .update({ views: article.views + 1 })
      .eq("id", id);

    res.json({
      success: true,
      data: { article },
    });
  } catch (error) {
    console.error("Get article error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/journal/categories
// @desc    Get all article categories
// @access  Public
router.get("/categories", async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from("articles")
      .select("category")
      .eq("published", true);

    if (error) {
      console.error("Get categories error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil kategori",
      });
    }

    // Count articles per category
    const categoryCount = categories.reduce((acc, article) => {
      acc[article.category] = (acc[article.category] || 0) + 1;
      return acc;
    }, {});

    const categoryList = Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count,
    }));

    res.json({
      success: true,
      data: { categories: categoryList },
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/journal/articles
// @desc    Create new article (Admin only)
// @access  Private
router.post("/articles", auth, articleValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors: errors.array(),
      });
    }

    const {
      title,
      content,
      category,
      excerpt,
      image,
      tags,
      published = false,
    } = req.body;

    // Check if user is admin (you might want to implement role-based access)
    // For now, allow any authenticated user to create articles

    const { data: article, error } = await supabase
      .from("articles")
      .insert([
        {
          title,
          content,
          category,
          excerpt: excerpt || content.substring(0, 200) + "...",
          image: image || "/main/journal/journal.jpg",
          tags: tags || [],
          published,
          author_id: req.user.userId,
          read_time: estimateReadTime(content),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Create article error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal membuat artikel",
      });
    }

    res.status(201).json({
      success: true,
      message: "Artikel berhasil dibuat",
      data: { article },
    });
  } catch (error) {
    console.error("Create article error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   PUT /api/journal/articles/:id
// @desc    Update article (Admin only)
// @access  Private
router.put("/articles/:id", auth, articleValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { title, content, category, excerpt, image, tags, published } =
      req.body;

    // Check if article exists and user is the author (or admin)
    const { data: existingArticle, error: checkError } = await supabase
      .from("articles")
      .select("author_id")
      .eq("id", id)
      .single();

    if (checkError || !existingArticle) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan",
      });
    }

    // For now, allow user to edit their own articles
    if (existingArticle.author_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses untuk mengedit artikel ini",
      });
    }

    const { data: article, error } = await supabase
      .from("articles")
      .update({
        title,
        content,
        category,
        excerpt: excerpt || content.substring(0, 200) + "...",
        image,
        tags,
        published,
        read_time: estimateReadTime(content),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update article error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal memperbarui artikel",
      });
    }

    res.json({
      success: true,
      message: "Artikel berhasil diperbarui",
      data: { article },
    });
  } catch (error) {
    console.error("Update article error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   DELETE /api/journal/articles/:id
// @desc    Delete article (Admin only)
// @access  Private
router.delete("/articles/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if article exists and user is the author (or admin)
    const { data: existingArticle, error: checkError } = await supabase
      .from("articles")
      .select("author_id")
      .eq("id", id)
      .single();

    if (checkError || !existingArticle) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan",
      });
    }

    if (existingArticle.author_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses untuk menghapus artikel ini",
      });
    }

    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) {
      console.error("Delete article error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal menghapus artikel",
      });
    }

    res.json({
      success: true,
      message: "Artikel berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete article error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/journal/articles/:id/bookmark
// @desc    Bookmark/unbookmark article
// @access  Private
router.post("/articles/:id/bookmark", auth, async (req, res) => {
  try {
    const { id: articleId } = req.params;
    const userId = req.user.userId;

    // Check if bookmark already exists
    const { data: existingBookmark } = await supabase
      .from("article_bookmarks")
      .select("id")
      .eq("user_id", userId)
      .eq("article_id", articleId)
      .single();

    if (existingBookmark) {
      // Remove bookmark
      const { error } = await supabase
        .from("article_bookmarks")
        .delete()
        .eq("user_id", userId)
        .eq("article_id", articleId);

      if (error) {
        console.error("Remove bookmark error:", error);
        return res.status(500).json({
          success: false,
          message: "Gagal menghapus bookmark",
        });
      }

      res.json({
        success: true,
        message: "Bookmark dihapus",
        data: { bookmarked: false },
      });
    } else {
      // Add bookmark
      const { error } = await supabase.from("article_bookmarks").insert([
        {
          user_id: userId,
          article_id: articleId,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Add bookmark error:", error);
        return res.status(500).json({
          success: false,
          message: "Gagal menambah bookmark",
        });
      }

      res.json({
        success: true,
        message: "Artikel berhasil dibookmark",
        data: { bookmarked: true },
      });
    }
  } catch (error) {
    console.error("Bookmark error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/journal/bookmarks
// @desc    Get user's bookmarked articles
// @access  Private
router.get("/bookmarks", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const {
      data: bookmarks,
      error,
      count,
    } = await supabase
      .from("article_bookmarks")
      .select(
        `
        *,
        article:articles(
          *,
          author:users!articles_author_id_fkey(
            id,
            full_name,
            profile_picture
          )
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", req.user.userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Get bookmarks error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil bookmark",
      });
    }

    const articles = bookmarks.map((bookmark) => bookmark.article);

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Helper function to estimate reading time
function estimateReadTime(content) {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

module.exports = router;

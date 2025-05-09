import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// DOM elements
const adminSections = document.querySelectorAll(".admin-section")
const sidebarLinks = document.querySelectorAll(".admin-sidebar a")
const totalQuizzesEl = document.getElementById("total-quizzes")
const totalQuestionsEl = document.getElementById("total-questions")
const totalResultsEl = document.getElementById("total-results")
const recentActivityList = document.getElementById("recent-activity-list")
const quizzesTableBody = document.getElementById("quizzes-table-body")
const createQuizBtn = document.getElementById("create-quiz-btn")
const createQuizForm = document.getElementById("create-quiz-form")
const addQuestionBtn = document.getElementById("add-question-btn")
const cancelCreateQuizBtn = document.getElementById("cancel-create-quiz")
const filterQuizSelect = document.getElementById("filter-quiz")
const resultsTableBody = document.getElementById("results-table-body")

// Admin state
let adminUser = null
let quizzes = []
let results = []

// Check if user is admin
async function checkAdmin() {
  try {
    // Check if user is logged in
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Redirect to login if not logged in
      window.location.href = "../login.html"
      return
    }

    // Check if user is admin
    const { data: userData, error } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

    if (error) {
      throw error
    }

    if (!userData || !userData.is_admin) {
      // Redirect to home if not admin
      window.location.href = "../index.html"
      return
    }

    adminUser = user
    return user
  } catch (error) {
    console.error("Error checking admin:", error)
    window.location.href = "../index.html"
  }
}

// Load dashboard stats
async function loadDashboardStats() {
  try {
    // Fetch quiz count
    const { count: quizCount, error: quizError } = await supabase
      .from("quizzes")
      .select("*", { count: "exact", head: true })

    if (quizError) throw quizError

    // Fetch question count
    const { count: questionCount, error: questionError } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })

    if (questionError) throw questionError

    // Fetch result count
    const { count: resultCount, error: resultError } = await supabase
      .from("results")
      .select("*", { count: "exact", head: true })

    if (resultError) throw resultError

    // Update UI
    if (totalQuizzesEl) totalQuizzesEl.textContent = quizCount
    if (totalQuestionsEl) totalQuestionsEl.textContent = questionCount
    if (totalResultsEl) totalResultsEl.textContent = resultCount
  } catch (error) {
    console.error("Error loading dashboard stats:", error)
  }
}

// Load recent activity
async function loadRecentActivity() {
  try {
    // Fetch recent results
    const { data: recentResults, error: resultError } = await supabase
      .from("results")
      .select(`
        id,
        completed_at,
        score,
        max_score,
        quizzes(title),
        users:user_id(email)
      `)
      .order("completed_at", { ascending: false })
      .limit(5)

    if (resultError) throw resultError

    // Clear loading message
    if (recentActivityList) {
      recentActivityList.innerHTML = ""

      if (recentResults.length === 0) {
        recentActivityList.innerHTML = "<li>No recent activity.</li>"
        return
      }

      // Add recent results to list
      recentResults.forEach((result) => {
        const li = document.createElement("li")
        const date = new Date(result.completed_at).toLocaleString()
        const percentage = Math.round((result.score / result.max_score) * 100)

        li.textContent = `${result.users.email} scored ${percentage}% on "${result.quizzes.title}" (${date})`
        recentActivityList.appendChild(li)
      })
    }
  } catch (error) {
    console.error("Error loading recent activity:", error)
    if (recentActivityList) {
      recentActivityList.innerHTML = "<li>Failed to load recent activity.</li>"
    }
  }
}

// Show admin section
function showSection(sectionId) {
  // Hide all sections
  adminSections.forEach((section) => {
    section.classList.remove("active")
  })

  // Show selected section
  document.getElementById(sectionId).classList.add("active")

  // Update sidebar links
  sidebarLinks.forEach((link) => {
    link.classList.remove("active")
    if (link.dataset.section === sectionId) {
      link.classList.add("active")
    }
  })

  // Load section data if needed
  if (sectionId === "dashboard") {
    loadDashboardStats()
    loadRecentActivity()
  } else if (sectionId === "quizzes") {
    loadQuizzes()
  } else if (sectionId === "results") {
    loadResults()
  }
}

// Event listeners
if (sidebarLinks) {
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      showSection(link.dataset.section)
    })
  })
}

// Initialize admin panel
document.addEventListener("DOMContentLoaded", async () => {
  // Check if user is admin
  const user = await checkAdmin()

  if (user) {
    // Add initial question to form
    if (document.getElementById("questions-container")) {
      addQuestion()
    }

    // Load dashboard data
    loadDashboardStats()
    loadRecentActivity()
  }
})

// Load quizzes function (simplified)
async function loadQuizzes() {
  try {
    // Fetch quizzes
    const { data, error } = await supabase
      .from("quizzes")
      .select(`
        id,
        title,
        description,
        created_at,
        questions:questions(count)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    quizzes = data

    // Update quizzes table
    if (quizzesTableBody) {
      quizzesTableBody.innerHTML = ""

      if (quizzes.length === 0) {
        quizzesTableBody.innerHTML = '<tr><td colspan="5">No quizzes found.</td></tr>'
        return
      }

      // Add quizzes to table
      quizzes.forEach((quiz) => {
        const tr = document.createElement("tr")
        const questionCount = quiz.questions[0].count
        const date = new Date(quiz.created_at).toLocaleDateString()

        tr.innerHTML = `
          <td>${quiz.title}</td>
          <td>${quiz.description || "No description"}</td>
          <td>${questionCount}</td>
          <td>${date}</td>
          <td class="actions">
            <button class="btn secondary edit-quiz-btn" data-id="${quiz.id}">Edit</button>
            <button class="btn danger delete-quiz-btn" data-id="${quiz.id}">Delete</button>
          </td>
        `

        quizzesTableBody.appendChild(tr)
      })
    }
  } catch (error) {
    console.error("Error loading quizzes:", error)
    if (quizzesTableBody) {
      quizzesTableBody.innerHTML = '<tr><td colspan="5">Failed to load quizzes.</td></tr>'
    }
  }
}

// Load results function (simplified)
async function loadResults(quizId = null) {
  try {
    // Build query
    let query = supabase
      .from("results")
      .select(`
        id,
        score,
        max_score,
        completed_at,
        quizzes:quiz_id(id, title),
        users:user_id(email)
      `)
      .order("completed_at", { ascending: false })

    // Filter by quiz if specified
    if (quizId) {
      query = query.eq("quiz_id", quizId)
    }

    // Execute query
    const { data, error } = await query

    if (error) throw error

    results = data

    // Update results table
    if (resultsTableBody) {
      resultsTableBody.innerHTML = ""

      if (results.length === 0) {
        resultsTableBody.innerHTML = '<tr><td colspan="6">No results found.</td></tr>'
        return
      }

      // Add results to table
      results.forEach((result) => {
        const tr = document.createElement("tr")
        const percentage = Math.round((result.score / result.max_score) * 100)
        const date = new Date(result.completed_at).toLocaleString()

        tr.innerHTML = `
          <td>${result.users.email}</td>
          <td>${result.quizzes.title}</td>
          <td>${result.score}/${result.max_score}</td>
          <td>${percentage}%</td>
          <td>${date}</td>
          <td class="actions">
            <button class="btn danger delete-result-btn" data-id="${result.id}">Delete</button>
          </td>
        `

        resultsTableBody.appendChild(tr)
      })
    }
  } catch (error) {
    console.error("Error loading results:", error)
    if (resultsTableBody) {
      resultsTableBody.innerHTML = '<tr><td colspan="6">Failed to load results.</td></tr>'
    }
  }
}

// Add question function (simplified)
function addQuestion() {
  const questionsContainer = document.getElementById("questions-container")
  if (!questionsContainer) return

  const questionIndex = document.querySelectorAll(".question-item").length

  const questionItem = document.createElement("div")
  questionItem.className = "question-item"
  questionItem.dataset.questionIndex = questionIndex

  questionItem.innerHTML = `
    <div class="question-header">
      <h4>Question ${questionIndex + 1}</h4>
      <button type="button" class="btn danger remove-question-btn">Remove</button>
    </div>
    <div class="form-group">
      <label for="question-text-${questionIndex}">Question Text</label>
      <input type="text" id="question-text-${questionIndex}" name="question-text-${questionIndex}" required>
    </div>
    <div class="options-container" data-question-index="${questionIndex}">
      <div class="option-item" data-option-index="0">
        <div class="form-group option-input">
          <label for="option-text-${questionIndex}-0">Option 1</label>
          <input type="text" id="option-text-${questionIndex}-0" name="option-text-${questionIndex}-0" required>
        </div>
        <div class="form-group option-correct">
          <label>
            <input type="radio" name="correct-option-${questionIndex}" value="0" required>
            Correct
          </label>
        </div>
        <button type="button" class="btn danger remove-option-btn">Remove</button>
      </div>
      <div class="option-item" data-option-index="1">
        <div class="form-group option-input">
          <label for="option-text-${questionIndex}-1">Option 2</label>
          <input type="text" id="option-text-${questionIndex}-1" name="option-text-${questionIndex}-1" required>
        </div>
        <div class="form-group option-correct">
          <label>
            <input type="radio" name="correct-option-${questionIndex}" value="1" required>
            Correct
          </label>
        </div>
        <button type="button" class="btn danger remove-option-btn">Remove</button>
      </div>
    </div>
    <button type="button" class="btn secondary add-option-btn" data-question-index="${questionIndex}">Add Option</button>
  `

  questionsContainer.appendChild(questionItem)
}

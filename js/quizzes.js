// Import Supabase client
import { createClient } from "@supabase/supabase-js"

// Supabase configuration
const supabaseUrl = "https://your-supabase-url.supabase.co" // Replace with your Supabase URL
const supabaseKey = "your-supabase-api-key" // Replace with your Supabase API key
const supabase = createClient(supabaseUrl, supabaseKey)

// DOM elements
const quizzesContainer = document.getElementById("quizzes-container")

// Load available quizzes
async function loadQuizzes() {
  try {
    // Fetch quizzes from Supabase
    const { data: quizzes, error } = await supabase
      .from("quizzes")
      .select(`
        id,
        title,
        description,
        created_at,
        questions:questions(count)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    // Clear loading message
    quizzesContainer.innerHTML = ""

    if (quizzes.length === 0) {
      quizzesContainer.innerHTML = '<p class="no-data">No quizzes available yet.</p>'
      return
    }

    // Render quizzes
    quizzes.forEach((quiz) => {
      const questionCount = quiz.questions[0].count

      const quizCard = document.createElement("div")
      quizCard.className = "quiz-card"
      quizCard.innerHTML = `
        <div class="quiz-card-content">
          <h3>${quiz.title}</h3>
          <p>${quiz.description || "No description provided."}</p>
        </div>
        <div class="quiz-card-footer">
          <div class="quiz-stats">
            <span>${questionCount} question${questionCount !== 1 ? "s" : ""}</span>
          </div>
          <a href="take-quiz.html?id=${quiz.id}" class="btn primary">Start Quiz</a>
        </div>
      `

      quizzesContainer.appendChild(quizCard)
    })
  } catch (error) {
    console.error("Error loading quizzes:", error)
    quizzesContainer.innerHTML = '<p class="error">Failed to load quizzes. Please try again later.</p>'
  }
}

// Load quizzes on page load
document.addEventListener("DOMContentLoaded", loadQuizzes)

import { createClient } from "@supabase/supabase-js"

// Supabase client (replace with your actual Supabase URL and Key)
const supabaseUrl = "https://onlgopvvyejgrdygerus.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubGdvcHZ2eWVqZ3JkeWdlcnVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NjAxNTksImV4cCI6MjA2MjMzNjE1OX0.qoSaBbss_wUnH0Y0O4pe4l7BGyn7tscxGCDvlKMsoPo"
const supabase = createClient(supabaseUrl, supabaseKey)

// DOM elements
const quizTitle = document.getElementById("quiz-title")
const quizDescription = document.getElementById("quiz-description")
const progressIndicator = document.getElementById("progress-indicator")
const currentQuestionEl = document.getElementById("current-question")
const totalQuestionsEl = document.getElementById("total-questions")
const questionText = document.getElementById("question-text")
const optionsContainer = document.getElementById("options-container")
const prevBtn = document.getElementById("prev-btn")
const nextBtn = document.getElementById("next-btn")
const submitBtn = document.getElementById("submit-btn")
const resultModal = document.getElementById("result-modal")
const closeModal = document.querySelector(".close-modal")
const userScoreEl = document.getElementById("user-score")
const maxScoreEl = document.getElementById("max-score")
const scorePercentageEl = document.getElementById("score-percentage")
const resultFeedback = document.getElementById("result-feedback")
const viewAnswersBtn = document.getElementById("view-answers-btn")

// Quiz state
let quiz = null
let questions = []
let currentQuestionIndex = 0
let userAnswers = []
let quizResult = null

// Get quiz ID from URL
const urlParams = new URLSearchParams(window.location.search)
const quizId = urlParams.get("id")

// Load quiz data
async function loadQuiz() {
  try {
    if (!quizId) {
      throw new Error("Quiz ID is missing")
    }

    // Fetch quiz data
    const { data: quizData, error: quizError } = await supabase.from("quizzes").select("*").eq("id", quizId).single()

    if (quizError) {
      throw quizError
    }

    quiz = quizData

    // Fetch questions for this quiz
    const { data: questionsData, error: questionsError } = await supabase
      .from("questions")
      .select(`
        id,
        question_text,
        options:options(
          id,
          option_text,
          is_correct
        )
      `)
      .eq("quiz_id", quizId)
      .order("created_at", { ascending: true })

    if (questionsError) {
      throw questionsError
    }

    questions = questionsData

    // Initialize user answers array
    userAnswers = new Array(questions.length).fill(null)

    // Update UI
    quizTitle.textContent = quiz.title
    quizDescription.textContent = quiz.description || "No description provided."
    totalQuestionsEl.textContent = questions.length

    // Display first question
    displayQuestion(0)
  } catch (error) {
    console.error("Error loading quiz:", error)
    alert("Failed to load quiz. Please try again later.")
    window.location.href = "quizzes.html"
  }
}

// Display question at given index
function displayQuestion(index) {
  if (index < 0 || index >= questions.length) {
    return
  }

  const question = questions[index]
  currentQuestionIndex = index

  // Update progress
  const progress = ((index + 1) / questions.length) * 100
  progressIndicator.style.width = `${progress}%`
  currentQuestionEl.textContent = index + 1

  // Update question text
  questionText.textContent = question.question_text

  // Clear options container
  optionsContainer.innerHTML = ""

  // Add options
  question.options.forEach((option, optionIndex) => {
    const optionItem = document.createElement("div")
    optionItem.className = "option-item"
    if (userAnswers[index] === option.id) {
      optionItem.classList.add("selected")
    }
    optionItem.textContent = option.option_text
    optionItem.dataset.optionId = option.id

    optionItem.addEventListener("click", () => {
      // Select this option
      document.querySelectorAll(".option-item").forEach((item) => {
        item.classList.remove("selected")
      })
      optionItem.classList.add("selected")
      userAnswers[currentQuestionIndex] = option.id

      // Enable next button if this is not the last question
      if (currentQuestionIndex < questions.length - 1) {
        nextBtn.disabled = false
      } else {
        // Show submit button on last question
        nextBtn.style.display = "none"
        submitBtn.style.display = "block"
      }
    })

    optionsContainer.appendChild(optionItem)
  })

  // Update navigation buttons
  prevBtn.disabled = index === 0
  nextBtn.disabled = userAnswers[index] === null

  // Show/hide submit button
  if (index === questions.length - 1) {
    nextBtn.style.display = "none"
    submitBtn.style.display = "block"
    submitBtn.disabled = userAnswers[index] === null
  } else {
    nextBtn.style.display = "block"
    submitBtn.style.display = "none"
  }
}

// Navigate to previous question
function goToPrevQuestion() {
  if (currentQuestionIndex > 0) {
    displayQuestion(currentQuestionIndex - 1)
  }
}

// Navigate to next question
function goToNextQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    displayQuestion(currentQuestionIndex + 1)
  }
}

// Submit quiz
async function submitQuiz() {
  try {
    // Check if all questions are answered
    const unansweredIndex = userAnswers.findIndex((answer) => answer === null)
    if (unansweredIndex !== -1) {
      alert(`Please answer question ${unansweredIndex + 1} before submitting.`)
      displayQuestion(unansweredIndex)
      return
    }

    // Get user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    // Calculate score
    let score = 0
    const correctAnswers = []

    questions.forEach((question, index) => {
      const correctOption = question.options.find((option) => option.is_correct)
      correctAnswers.push(correctOption.id)

      if (userAnswers[index] === correctOption.id) {
        score++
      }
    })

    // Save result to database
    const { data: resultData, error: resultError } = await supabase
      .from("results")
      .upsert({
        quiz_id: quizId,
        user_id: user.id,
        score: score,
        max_score: questions.length,
        completed_at: new Date(),
      })
      .select()
      .single()

    if (resultError) {
      throw resultError
    }

    quizResult = {
      score,
      maxScore: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      correctAnswers,
    }

    // Show result modal
    showResults()
  } catch (error) {
    console.error("Error submitting quiz:", error)
    alert("Failed to submit quiz. Please try again.")
  }
}

// Show quiz results
function showResults() {
  userScoreEl.textContent = quizResult.score
  maxScoreEl.textContent = quizResult.maxScore
  scorePercentageEl.textContent = `${quizResult.percentage}%`

  // Generate feedback based on score
  let feedback = ""
  if (quizResult.percentage >= 90) {
    feedback = "Excellent! You have a great understanding of this topic."
  } else if (quizResult.percentage >= 70) {
    feedback = "Good job! You have a solid grasp of this material."
  } else if (quizResult.percentage >= 50) {
    feedback = "Not bad. With a bit more study, you can improve your score."
  } else {
    feedback = "You might want to review this topic again and try once more."
  }

  resultFeedback.textContent = feedback

  // Show modal
  resultModal.style.display = "block"
}

// View answers
function viewAnswers() {
  // Hide modal
  resultModal.style.display = "none"

  // Display questions with correct/incorrect indicators
  questions.forEach((question, index) => {
    const userAnswer = userAnswers[index]
    const correctAnswer = quizResult.correctAnswers[index]

    // Update options to show correct/incorrect
    const optionItems = document.querySelectorAll(".option-item")
    optionItems.forEach((item) => {
      const optionId = item.dataset.optionId

      if (optionId === correctAnswer) {
        item.classList.add("correct")
        item.innerHTML += ' <span class="correct-indicator">✓ Correct</span>'
      } else if (optionId === userAnswer && userAnswer !== correctAnswer) {
        item.classList.add("incorrect")
        item.innerHTML += ' <span class="incorrect-indicator">✗ Incorrect</span>'
      }
    })
  })

  // Disable all interactive elements
  document.querySelectorAll(".option-item").forEach((item) => {
    item.style.pointerEvents = "none"
  })

  prevBtn.style.display = "none"
  nextBtn.style.display = "none"
  submitBtn.style.display = "none"

  // Add a "Back to Quizzes" button
  const backBtn = document.createElement("a")
  backBtn.href = "quizzes.html"
  backBtn.className = "btn primary"
  backBtn.textContent = "Back to Quizzes"
  document.querySelector(".quiz-navigation").appendChild(backBtn)
}

// Event listeners
if (prevBtn) prevBtn.addEventListener("click", goToPrevQuestion)
if (nextBtn) nextBtn.addEventListener("click", goToNextQuestion)
if (submitBtn) submitBtn.addEventListener("click", submitQuiz)
if (closeModal)
  closeModal.addEventListener("click", () => {
    resultModal.style.display = "none"
  })
if (viewAnswersBtn) viewAnswersBtn.addEventListener("click", viewAnswers)

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === resultModal) {
    resultModal.style.display = "none"
  }
})

// Load quiz on page load
document.addEventListener("DOMContentLoaded", loadQuiz)

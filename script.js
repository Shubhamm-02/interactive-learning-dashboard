// ===============================
// Constants and Global Variables
// ===============================
const resourcesList = document.getElementById('resources-list');
const healthTipsList = document.getElementById('health-tips-list');
const startQuizButton = document.getElementById('start-quiz');
const quizContainer = document.getElementById('quiz-container');

let currentQuestionIndex = 0;
let score = 0;
let currentSubject = null;
let currentQuestions = [];
let progressChart = null;

const progressData = {
    Geography: { correct: 0, total: 0 },
    Math: { correct: 0, total: 0 },
    Science: { correct: 0, total: 0 },
    Biology: { correct: 0, total: 0 },
    Literature: { correct: 0, total: 0 }
};

// ===============================
// Quiz Questions Database
// ===============================
const quizQuestions = {
    Geography: [
        {
            question: "What is the capital of France?",
            options: ["Paris", "London", "Berlin", "Madrid"],
            correct: "Paris",
            
        },
        {
            question: "Which is the largest continent?",
            options: ["Asia", "Africa", "North America", "Europe"],
            correct: "Asia"
        },
        {
            question: "What is the largest planet in our solar system?",
            options: ["Earth", "Jupiter", "Mars", "Saturn"],
            correct: "Jupiter"
        },
        {
            question: "Which desert is the largest in the world?",
                options: ["Sahara", "Arabian", "Antarctic", "Gobi"],
                correct: "Sahara"
            
        }
    ],
    Math: [
        {
            question: "What is 2 + 2?",
            options: ["3", "4", "5", "6"],
            correct: "4"
        },
        {
            question: "What is the square root of 16?",
            options: ["2", "4", "6", "8"],
            correct: "4"
        },
        {
            question: "What is 3 × 7?",
            options: ["18", "21", "24", "28"],
            correct: "21"
        }
    ],
    Science: [
   
        {
            question: "What is the chemical symbol for water?",
            options: ["H2O", "CO2", "NaCl", "MgO"],
            correct: "H2O"
        },
        {
            question: "What is the chemical symbol for gold?",
            options: ["Au", "Ag", "Fe", "Cu"],
            correct: "Au"
        },
        {
            question: "What is the speed of light?",
            options: ["299,792 km/s", "199,792 km/s", "399,792 km/s", "499,792 km/s"],
            correct: "299,792 km/s"
        }
    ],
    Biology: [
        {
            question: "What is the largest mammal on Earth?",
            options: ["Blue Whale", "African Elephant", "Giraffe", "Hippopotamus"],
            correct: "Blue Whale"
        },
        {
            question: "What is the powerhouse of the cell?",
            options: ["Mitochondria", "Nucleus", "Ribosome", "Golgi Body"],
            correct: "Mitochondria"
        },
        {
            question: "Which blood type is known as the universal donor?",
            options: ["O-", "AB+", "A+", "B-"],
            correct: "O-"
        }
    ],
    Literature: [
        {
            question: "Who wrote 'Romeo and Juliet'?",
            options: ["William Shakespeare", "Charles Dickens", "Jane Austen", "Mark Twain"],
            correct: "William Shakespeare"
        },
        {
            question: "Who wrote '1984'?",
            options: ["George Orwell", "Aldous Huxley", "Ray Bradbury", "Ernest Hemingway"],
            correct: "George Orwell"
        },
        {
            question: "What is the first book in the Harry Potter series?",
            options: ["Philosopher's Stone", "Chamber of Secrets", "Prisoner of Azkaban", "Goblet of Fire"],
            correct: "Philosopher's Stone"
        }
    ]
};

// ===============================
// API Functions
// ===============================
async function fetchLearningResources() {
    try {
        const response = await fetch('https://openlibrary.org/subjects/computer_science.json?limit=10');
        const data = await response.json();
        
        const booksContainer = document.createElement('div');
        booksContainer.className = 'books-grid';
        
        data.works.forEach(book => {
            const coverId = book.cover_id;
            const coverUrl = coverId 
                ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
                : 'https://via.placeholder.com/80x120?text=No+Cover';

            const bookElement = document.createElement('div');
            bookElement.className = 'book-item';
            bookElement.innerHTML = `
                <div class="resource-card">
                    <div class="book-content">
                        <div class="book-image-container">
                            <img src="${coverUrl}" alt="${book.title}" class="book-cover" loading="lazy">
                        </div>
                        <div class="book-info">
                            <h4>${book.title}</h4>
                            <p class="author">By ${book.authors?.[0]?.name || 'Unknown Author'}</p>
                            <p class="description">${book.description || 'No description available'}</p>
                            <a href="https://openlibrary.org${book.key}" target="_blank" class="learn-more-btn">Learn More</a>
                        </div>
                    </div>
                </div>
            `;
            booksContainer.appendChild(bookElement);
        });

        resourcesList.innerHTML = '';
        resourcesList.appendChild(booksContainer);

    } catch (error) {
        console.error('Error fetching resources:', error);
        resourcesList.innerHTML = '<p>Failed to load resources. Please try again later.</p>';
    }
}

async function fetchHealthTips() {
    const appId = 'fce0fb72';
    const appKey = '23be55948cb2883d15052fa258c81b2b';
    const url = `https://api.edamam.com/api/recipes/v2?type=public&q=healthy&app_id=${appId}&app_key=${appKey}&mealType=snack&random=true`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        healthTipsList.innerHTML = '';
        
        data.hits.slice(0, 5).forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="tip-card">
                    <img src="${item.recipe.image}" alt="${item.recipe.label}" class="tip-image">
                    <h4>${item.recipe.label}</h4>
                    <p>Calories: ${Math.round(item.recipe.calories)}</p>
                    <a href="${item.recipe.url}" target="_blank">View Recipe</a>
                </div>
            `;
            healthTipsList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching health tips:', error);
        healthTipsList.innerHTML = '<p>Failed to load health tips. Please try again later.</p>';
    }
}

// ===============================
// Quiz Functions
// ===============================
function initializeQuizUI() {
    const quizSection = document.getElementById('quiz-section');
    quizSection.innerHTML = `
        <h2>Take a Quiz</h2>
        <div class="subject-selection">
            <h3>Select a Subject:</h3>
            <div class="subject-buttons">
                ${Object.keys(quizQuestions).map(subject => `
                    <button class="subject-btn" data-subject="${subject}">
                        ${subject}
                    </button>
                `).join('')}
            </div>
        </div>
        <div id="quiz-container"></div>
        <button id="start-quiz" style="display: none;">Start Quiz</button>
    `;

    // Update references after recreating the DOM elements
    const subjectButtons = document.querySelectorAll('.subject-btn');
    const startQuizBtn = document.getElementById('start-quiz');

    subjectButtons.forEach(button => {
        button.addEventListener('click', () => selectSubject(button.dataset.subject));
    });

    startQuizBtn.addEventListener('click', startQuiz);
}

function selectSubject(subject) {
    if (currentSubject && currentQuestionIndex > 0) {
        if (!confirm('Are you sure you want to switch subjects? Your current quiz progress will be lost.')) {
            return;
        }
    }
    
    currentSubject = subject;
    currentQuestions = [...quizQuestions[subject]];
    
    // Update UI to show selected subject
    document.querySelectorAll('.subject-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.subject === subject) {
            btn.classList.add('selected');
        }
    });
    
    // Show start quiz button with proper styling
    const startQuizBtn = document.getElementById('start-quiz');
    startQuizBtn.style.display = 'block';  // Ensure it's displayed as block
    
    // Clear any existing quiz content
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = '';
}

function startQuiz() {
    if (!currentSubject) return;
    
    currentQuestionIndex = 0;
    score = 0;
    
    // Shuffle questions
    currentQuestions = [...quizQuestions[currentSubject]].sort(() => Math.random() - 0.5);
    
    // Hide start button and disable subject buttons
    const startQuizBtn = document.getElementById('start-quiz');
    startQuizBtn.style.display = 'none';
    
    document.querySelectorAll('.subject-btn').forEach(btn => btn.disabled = true);
    
    // Display first question
    displayQuestion();
}

function displayQuestion() {
    const quizContainer = document.getElementById('quiz-container');
    
    if (!currentQuestions[currentQuestionIndex]) {
        showQuizResults();
        return;
    }

    const question = currentQuestions[currentQuestionIndex];
    quizContainer.innerHTML = `
        <div class="question-card">
            <button onclick="confirmQuit()" class="quit-quiz-btn">Quit Quiz</button>
            <h3>${question.question}</h3>
            <div class="options-container">
                ${question.options.map((option) => `
                    <button class="option-btn" onclick="checkAnswer('${option}')">
                        ${option}
                    </button>
                `).join('')}
            </div>
            <p class="question-progress">Question ${currentQuestionIndex + 1} of ${currentQuestions.length}</p>
            <p class="current-subject">Subject: ${currentSubject}</p>
        </div>
    `;
}


function checkAnswer(selectedAnswer) {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct;
    
    if (isCorrect) {
        score++;
    }
    
    updateProgress(currentSubject, isCorrect);

    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(button => {
        button.disabled = true;
        if (button.textContent.trim() === currentQuestion.correct) {
            button.classList.add('correct');
        } else if (button.textContent.trim() === selectedAnswer && !isCorrect) {
            button.classList.add('incorrect');
        }
    });

    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    feedbackDiv.innerHTML = `
        <p>${isCorrect ? 'Correct!' : `Incorrect. The correct answer is ${currentQuestion.correct}`}</p>
        <button onclick="nextQuestion()" class="next-btn">Next Question</button>
    `;
    document.querySelector('.question-card').appendChild(feedbackDiv);
}

function nextQuestion() {
    currentQuestionIndex++;
    displayQuestion();
}

function showQuizResults() {
    const percentage = (score / currentQuestions.length) * 100;
    
    quizContainer.innerHTML = `
        <div class="results-card">
            <h3>Quiz Complete!</h3>
            <p>Subject: ${currentSubject}</p>
            <p>You got ${score} out of ${currentQuestions.length} questions correct.</p>
            <p>Your score: ${percentage}%</p>
            <div class="quiz-controls">
                <button onclick="resetQuiz()" class="restart-btn">Choose Another Subject</button>
                <button onclick="retryQuiz()" class="retry-btn">Retry This Subject</button>
            </div>
        </div>
    `;
    
    document.querySelectorAll('.subject-btn').forEach(btn => btn.disabled = false);
    updateChart();
}

function resetQuiz() {
    // Reset all quiz state variables
    currentSubject = null;
    currentQuestions = [];
    currentQuestionIndex = 0;
    score = 0;

    // Reset UI elements
    const startQuizBtn = document.getElementById('start-quiz');
    startQuizBtn.style.display = 'none';
    
    // Enable and unselect all subject buttons
    document.querySelectorAll('.subject-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.disabled = false;
    });
    
    // Clear the quiz container
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = '';
}

function retryQuiz() {
    score = 0;
    currentQuestionIndex = 0;
    currentQuestions = [...quizQuestions[currentSubject]].sort(() => Math.random() - 0.5);
    displayQuestion();
}
function confirmQuit() {
    if (confirm('Are you sure you want to quit this quiz? Your progress will be lost.')) {
        resetQuiz();
    }
}
// ===============================
// Progress Chart Functions
// ===============================
function initializeChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    progressChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(progressData),
            datasets: [{
                label: 'Success Rate (%)',
                data: Object.values(progressData).map(topic => 
                    topic.total === 0 ? 0 : (topic.correct / topic.total) * 100
                ),
                backgroundColor: '#6200ea',
                borderColor: '#3700b3',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Success Rate (%)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateProgress(topic, isCorrect) {
    progressData[topic].total++;
    if (isCorrect) {
        progressData[topic].correct++;
    }
    updateChart();
}

function updateChart() {
    if (!progressChart) {
        initializeChart();
    } else {
        progressChart.data.datasets[0].data = Object.values(progressData).map(topic => 
            topic.total === 0 ? 0 : (topic.correct / topic.total) * 100
        );
        progressChart.update();
    }
}

// ===============================
// Styles
// ===============================
const quizStyles = `
.option-btn {
    width: 100%;
    padding: 10px;
    margin: 5px 0;
    border: 2px solid var(--primary-color);
    background: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    }

    .option-btn:hover:not(:disabled) {
        background: var(--primary-color);
        color: white;
    }

    .option-btn.correct {
        background-color: #4caf50;
        border-color: #4caf50;
        color: white;
    }

    .option-btn.incorrect {
        background-color: #f44336;
        border-color: #f44336;
        color: white;
    }

    .feedback {
        margin-top: 15px;
        padding: 10px;
        border-radius: 8px;
        text-align: center;
    }

    .feedback.correct {
        background-color: #e8f5e9;
        color: #4caf50;
    }

    .feedback.incorrect {
        background-color: #ffebee;
        color: #f44336;
    }

    .next-btn, .restart-btn {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        margin-top: 10px;
    }

    .question-progress {
        text-align: center;
        margin-top: 15px;
        color: var(--secondary-text);
    }
`;

const additionalStyles = `
    /* General Animations */
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes slideIn {
        from {
            transform: translateX(-20px);
            opacity: 0;
            }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
        100% {
            transform: scale(1);
        }
    }

    /* Quiz Container Styles */
    #quiz-section {
        animation: fadeIn 0.8s ease-out;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    }

    .question-card {
        background: white;
        padding: 30px;
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
        position: relative;
        transition: all 0.3s ease;
        animation: fadeIn 0.5s ease-out;
        border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .question-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
    }

    /* Subject Selection Styles */


    .subject-selection {
        margin-bottom: 30px;
        animation: slideIn 0.5s ease-out;
    }

    .subject-buttons {
        display: flex;  /* Changed from grid to flex */
        justify-content: center;  /* Center the buttons */
        gap: 15px;
        margin-top: 20px;
        flex-wrap: nowrap;  /* Prevent wrapping */
        overflow-x: auto;  /* Allow horizontal scrolling if needed */
        padding: 10px 0;  /* Add some padding for scrollbar */
    }

    
    .subject-btn {
        flex: 0 0 auto;  /* Prevent button shrinking */
        padding: 15px 20px;
        border: 2px solid var(--primary-color);
        background: transparent;
        color: var(--primary-color);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-size: 0.9rem;
        white-space: nowrap; 
        }
  

    .subject-btn:hover {
        background: var(--primary-color);
        color: white;
        transform: translateY(-3px);
        box-shadow: 0 6px 12px rgba(98, 0, 234, 0.2);
    }

    .subject-btn.selected {
        background: var(--primary-color);
        color: white;
        animation: pulse 0.3s ease-in-out;
    }

    /* Option Buttons Styles */
    .options-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 25px;
    }

    .option-btn {
        width: 100%;
        padding: 15px 20px;
        border: 2px solid #e0e0e0;
        background: white;
        color: var(--text-color);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 1rem;
        position: relative;
        overflow: hidden;
        }

    .option-btn::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: rgba(98, 0, 234, 0.1);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: width 0.6s ease, height 0.6s ease;
    }

    .option-btn:hover::before {
        width: 300px;
        height: 300px;
    }

    .option-btn:hover {
        border-color: var(--primary-color);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .option-btn.correct {
        background: linear-gradient(45deg, #4CAF50, #45a049);
        border-color: #4CAF50;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }

    .option-btn.incorrect {
        background: linear-gradient(45deg, #F44336, #e53935);
        border-color: #F44336;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
    }
    
    /* Feedback Styles */
    .feedback {
        margin-top: 25px;
        padding: 20px;
        border-radius: 12px;
        text-align: center;
        animation: fadeIn 0.4s ease-out;
        backdrop-filter: blur(10px);
    }
    
    .feedback.correct {
        background: rgba(76, 175, 80, 0.1);
        border: 2px solid #4CAF50;
        color: #2E7D32;
    }

    .feedback.incorrect {
        background: rgba(244, 67, 54, 0.1);
        border: 2px solid #F44336;
        color: #C62828;
        }

    .feedback p {
        font-size: 1.2rem;
        margin-bottom: 15px;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    }

    /* Next Button Styles */
    .next-btn {
        background: linear-gradient(45deg, var(--primary-color), #7c4dff);
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 12px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 600;
        transition: all 0.3s ease;
        margin-top: 15px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .next-btn:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 8px 16px rgba(98, 0, 234, 0.3);
        }

        /* Progress Indicator */
        .question-progress {
        margin-top: 25px;
        text-align: center;
        color: var(--secondary-text);
        font-size: 0.95rem;
        font-weight: 500;
        letter-spacing: 0.5px;
        opacity: 0.8;
    }

    /* Results Card Styles */
    .results-card {
        background: white;
        padding: 30px;
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        text-align: center;
        animation: fadeIn 0.5s ease-out;
    }

    .results-card h3 {
        color: var(--primary-color);
        font-size: 1.8rem;
        margin-bottom: 20px;
    }
    
    .quiz-controls {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 25px;
    }

    .restart-btn, .retry-btn {
        padding: 12px 24px;
        border-radius: 12px;
        cursor: pointer;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: all 0.3s ease;
    }

    .restart-btn {
        background: var(--primary-color);
        color: white;
        border: none;
    }

    .retry-btn {
        background: transparent;
        color: var(--primary-color);
        border: 2px solid var(--primary-color);
    }

    .restart-btn:hover, .retry-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(98, 0, 234, 0.2);
    }

    /* Quit Button Styles */
    .quit-quiz-btn {
        position: absolute;
        top: 15px;
        right: 15px;
        background: rgba(244, 67, 54, 0.1);
        color: #F44336;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s ease;
        }

    .quit-quiz-btn:hover {
        background: #F44336;
        color: white;
        transform: translateY(-2px);
    }

    /* Glass Morphism Effect */
    .glass-effect {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

     /* Start Quiz Button Styles */
    #start-quiz {
        display: block;  /* Changed from inline to block */
        margin: 20px auto;  /* Center the button */
        padding: 15px 30px;
        background: linear-gradient(45deg, var(--primary-color), #7c4dff);
        color: white;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-size: 1.1rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        transition: all 0.3s ease;
        min-width: 200px;  /* Minimum width for better appearance */
        box-shadow: 0 4px 12px rgba(98, 0, 234, 0.2);
    }

    #start-quiz:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(98, 0, 234, 0.3);
    }

    #start-quiz:active {
        transform: translateY(1px);
        }
        
    /* Animation for start quiz button appearance */
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    #start-quiz {
        animation: fadeInUp 0.5s ease-out;
    }
`;




// ===============================
// Dark Mode
// ===============================


// Dark mode toggle functionality
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Toggle theme
    darkModeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Initialize dark mode when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDarkMode);

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
});



const resourceStyles = `
    #resources-section {
        margin: 15px 0;
        }

    #resources-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .books-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        padding: 10px;
        width: 100%;
    }

    .resource-card {
        background: white;
        border-radius: 10px;
        padding: 15px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
    }

    .book-content {
        display: flex;
        gap: 15px;
    }

    .book-image-container {
        flex: 0 0 100px;
        height: 140px;
        border-radius: 6px;
        overflow: hidden;
    }

    .book-cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .book-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .book-info h4 {
        color: var(--primary-color);
        font-size: 1rem;
        margin: 0;
        line-height: 1.4;
        font-weight: 600;
    }

    .author {
        color: var(--secondary-text);
        font-size: 0.9rem;
        margin: 0;
        font-style: italic;
    }

    .description {
        color: var(--text-color);
        font-size: 0.9rem;
        line-height: 1.4;
        margin: 0;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
    }

    .learn-more-btn {
        display: inline-block;
        padding: 8px 16px;
        background: var(--primary-color);
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-size: 0.9rem;
        margin-top: auto;
        transition: all 0.3s ease;
    }

    .learn-more-btn:hover {
        background: var(--hover-color);
        transform: translateY(-2px);
    }

    @media (max-width: 768px) {
        .books-grid {
            grid-template-columns: 1fr;
        }
    }
`;




const additionalGlobalStyles = `
    /* Reduce spacing in header */
    header {
        padding: 10px 20px;
        margin-bottom: 15px;
    }

    header h1 {
        margin: 0;
        font-size: 1.8rem;
    }

    /* Adjust main content spacing */
    main {
        padding: 0 15px;
    }

    /* Reduce section spacing */
    section {
        margin-bottom: 20px;
        padding: 15px;
    }

    /* Adjust heading sizes and spacing */
    h2 {
        font-size: 1.4rem;
        margin: 0 0 12px 0;
    }

    /* Reduce quiz section spacing */
    #quiz-section {
        padding: 15px;
    }

    .subject-buttons {
        gap: 10px;
        margin: 10px 0;
    }

    .subject-btn {
        padding: 8px 16px;
        font-size: 0.9rem;
    }

    /* Adjust health tips spacing */
    #health-tips-section {
        margin-top: 15px;
    }

    #health-tips-list {
        gap: 12px;
        padding: 0;
    }

    /* Progress chart adjustments */
    #progress-section {
        padding: 12px;
        margin-bottom: 15px;
    }

    #progressChart {
        height: 250px;
        margin: 8px 0;
    }

    /* Question card adjustments */
    .question-card {
        padding: 15px;
        margin-bottom: 15px;
    }

    .options-container {
        gap: 8px;
        margin-top: 12px;
    }

    .option-btn {
        padding: 8px 12px;
        font-size: 0.9rem;
    }

    /* Feedback adjustments */
    .feedback {
        margin-top: 12px;
        padding: 10px;
    }

    /* General spacing utilities */
    .mt-1 { margin-top: 0.5rem; }
    .mb-1 { margin-bottom: 0.5rem; }
    .py-1 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .px-1 { padding-left: 0.5rem; padding-right: 0.5rem; }
`;






// ===============================
// Initialization
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    fetchLearningResources();
    fetchHealthTips();
    initializeChart();
    initializeQuizUI();
    
    const styleElement = document.createElement('style');
    styleElement.textContent = additionalStyles;
    document.head.appendChild(styleElement);

    document.querySelectorAll('.question-card, .results-card').forEach(card => {
        card.classList.add('glass-effect');
    });
});
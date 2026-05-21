# Advanced To-Do App

A feature-rich, highly interactive To-Do application built entirely with vanilla web technologies (HTML, CSS, and JavaScript). This application helps users organize their daily tasks with advanced features like categorization, tagging, drag-and-drop reordering, and dark mode.

## ✨ Features

* **Comprehensive Task Management:** Easily add, edit, complete, and delete tasks.
* **Task Attributes:** Organize tasks by assigning Priority (Low, Medium, High), predefined Categories (Work, Personal, Shopping, Health, Finance, Other), Due Dates, and custom comma-separated tags.
* **Drag and Drop:** Intuitively reorder tasks in your list using the drag handle.
* **Advanced Searching & Filtering:** Search for tasks by text or by specific tags (using `#tag`), and filter the view by Completion Status or Category.
* **Progress Tracking:** A dynamic progress bar visually represents the percentage of completed tasks alongside real-time task counter badges.
* **Custom Modals:** Features custom-built UI modals for editing tasks and confirming deletions, ensuring a smooth user experience without relying on intrusive native browser alerts.
* **Theme Customization:** Toggle between Light and Dark modes, with your preference automatically saved.
* **Data Persistence:** All tasks and theme settings are saved locally in the browser using `localStorage`, ensuring data is not lost on a page refresh.
* **Responsive & Animated Design:** A mobile-friendly layout with smooth CSS animations for fading, sliding, and error-shaking.

## 🛠️ Technologies Used

* **HTML5:** Semantic structure and layout.
* **CSS3:** Styling, variables for theme switching, flexbox for layout, and keyframe animations.
* **Vanilla JavaScript (ES6+):** DOM manipulation, event handling, drag-and-drop API, and local storage management without external dependencies.

## 🚀 How to Run

Because this app uses vanilla web technologies without any build steps or external dependencies, running it is incredibly simple:

1. Clone or download the repository to your local machine.
2. Ensure `index.html`, `script.js`, and `styles.css` are all in the same folder.
3. Simply double-click `index.html` to open it in your preferred web browser.

## 📁 File Structure

* `index.html`: Contains the core structure of the app, including the input forms, search bar, modals, and list containers.
* `styles.css`: Contains all visual styling, responsive media queries, and transition animations.
* `script.js`: Contains all the application logic, state management, event listeners, and filtering algorithms.

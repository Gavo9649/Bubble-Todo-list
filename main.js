// Select important DOM elements
const taskContainer = document.getElementById('taskContainer');
const taskText = document.getElementById('taskText');
const dateText = document.getElementById('dateText');
const addTaskButton = document.getElementById('addTaskButton');

// Define a list of color presets
const colorPresets = ['#b92828a6', '#2830c1a6', '#1c9d29a6', '#10d3d398', '#ee1b88a3', '#aa3ee99f'];
let selectedCircle = null;
let isDragging = false; // Flag to track if the circle is being dragged

// Create an object to store the current color index for each circle
const circleColorIndexes = {};

// Function to create a new task circle
function createTask(text, savedAttributes = null) {
    // Create a new task circle element
    const taskCircle = document.createElement('div');
    taskCircle.classList.add('task-circle');

    // Create a new task text element for the circle
    const taskTextElement = document.createElement('div');
    taskTextElement.classList.add('task-text');
    let title = "Other:\n";
    taskTextElement.textContent = text;

    // Append the task text to the task circle
    taskCircle.appendChild(taskTextElement);

    // Append the task circle to the task container
    taskContainer.appendChild(taskCircle);

    // Set initial circle size and text size
    let circleSize = 100; // Initial circle size
    const minCircleSize = 50; // Minimum circle size
    const maxCircleSize = 500; // Maximum circle size

    // Function to update the circle and text size
    function updateSize() {
        // Update the circle size with minimum and maximum limits
        circleSize = Math.min(maxCircleSize, Math.max(minCircleSize, circleSize));
        taskCircle.style.width = circleSize + 'px';
        taskCircle.style.height = circleSize + 'px';

        // Calculate the maximum text size as a percentage of the circle's radius
        const maxTextSize = circleSize * 0.1; // 40% of the circle's radius

        // Update the text size with minimum and maximum limits
        const minTextSize = 10; // Minimum text size
        const textSize = Math.min(maxTextSize, Math.max(minTextSize, maxTextSize));
        taskTextElement.style.fontSize = textSize + 'px';
    }

    // Add a wheel event listener to change the size on scroll
    taskCircle.addEventListener('wheel', (e) => {
        e.preventDefault();
        const scaleFactor = e.deltaY > 0 ? 0.95 : 1.05; // Adjust as needed

        // Update circle size
        circleSize *= scaleFactor;

        // Update the size with limits and reposition to keep the center fixed
        const rect = taskCircle.getBoundingClientRect();
        const newWidth = Math.min(maxCircleSize, Math.max(minCircleSize, rect.width * scaleFactor));
        const newHeight = Math.min(maxCircleSize, Math.max(minCircleSize, rect.height * scaleFactor));
        const newTop = rect.top + (rect.height - newHeight) / 2;
        const newLeft = rect.left + (rect.width - newWidth) / 2;

        taskCircle.style.width = newWidth + 'px';
        taskCircle.style.height = newHeight + 'px';
        taskCircle.style.top = newTop + 'px';
        taskCircle.style.left = newLeft + 'px';

        // Update the text size
        updateSize();
        saveTasksToLocalStorage();
    });

    // Add a double click event listener to remove the task
    taskCircle.addEventListener('dblclick', () => {
        taskCircle.remove();
        saveTasksToLocalStorage(); // Save the updated tasks after removal
    });

    // Add a mousedown event listener to set the dragging flag
    taskCircle.addEventListener('mousedown', () => {
        isDragging = false;
    });

    // Add a mousemove event listener to detect dragging
    taskCircle.addEventListener('mousemove', () => {
        isDragging = true;
    });

    // Add a click event listener to handle click and change color
    taskCircle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the click from propagating to the container

        // Only change the color if the circle is not being dragged
        if (!isDragging) {
            // Check if this circle already has a color index
            if (circleColorIndexes[taskCircle] === undefined) {
                // If not, set it to 0 (the first color preset)
                circleColorIndexes[taskCircle] = 0;
            } else {
                // Increment the color index, and wrap around if needed
                circleColorIndexes[taskCircle] = (circleColorIndexes[taskCircle] + 1) % colorPresets.length;
            }

            // Get the current color index for this circle
            const currentIndex = circleColorIndexes[taskCircle];

            // Set the color of the circle based on the current index
            taskCircle.style.backgroundColor = colorPresets[currentIndex];

            // Set this circle as the selectedCircle
            selectedCircle = taskCircle;
            switch (colorPresets[currentIndex]) {
                case '#b92828a6': //red
                    title = "ENGR 1550:\n";
                    taskTextElement.textContent = title + text;
                    break;
                case '#2830c1a6': //blue
                    title = "Math 1513:\n";
                    taskTextElement.textContent = title + text;
                    break;
                case '#1c9d29a6': //green
                    title = "Chem 1515:\n";
                    taskTextElement.textContent = title + text;
                    break;
                case '#10d3d398': //light blue
                    title = "YSU 1500:\n";
                    taskTextElement.textContent = title + text;
                    break;
                case '#ee1b88a3': //pink-ish
                    title = "ENGR 1500:\n";
                    taskTextElement.textContent = title + text;
                    break;
                case '#aa3ee99f': //purple
                    title = "HST 1500:\n";
                    taskTextElement.textContent = title + text;
                    break;
                // case '#': //
                //     title = "New:\n";
                //     taskTextElement.textContent = title + text;
                //     break;
                // case '#': //
                //     title = "New:\n";
                //     taskTextElement.textContent = title + text;
                //     break;
                // case '#': //
                //     title = "New:\n";
                //     taskTextElement.textContent = title + text;
                //     break;
                default:
                    title = "Other:\n";
                    taskTextElement.textContent = title + text;
            }

            saveTasksToLocalStorage(); // Save the updated tasks after color change
        }
    });

    // Make the task circle draggable (Call the dragElement function)
    dragElement(taskCircle);

    // Initialize the size
    updateSize();

    // Load saved attributes if provided
    if (savedAttributes) {
        taskCircle.style.left = savedAttributes.left + 'px';
        taskCircle.style.top = savedAttributes.top + 'px';
        taskCircle.style.backgroundColor = savedAttributes.backgroundColor;
        circleSize = savedAttributes.circleSize;
        updateSize();
    }
}

// Function to make an element draggable
function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (elmnt) {
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when the mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
        saveTasksToLocalStorage(); // Save the updated tasks after dragging
    }
}

// Function to save tasks to local storage
function saveTasksToLocalStorage() {
    const tasks = [];
    const taskElements = document.querySelectorAll('.task-circle');
    taskElements.forEach((taskElement) => {
        const rect = taskElement.getBoundingClientRect();
        const backgroundColor = taskElement.style.backgroundColor;
        const circleSize = parseFloat(taskElement.style.width); // Get circle size
        const fontSize = parseFloat(taskElement.querySelector('.task-text').style.fontSize);
        tasks.push({
            left: rect.left,
            top: rect.top,
            backgroundColor,
            circleSize, // Save circle size
            fontSize,
            text: taskElement.querySelector('.task-text').textContent,
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to load tasks from local storage and recreate them
function loadTasksFromLocalStorage() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    console.log(savedTasks)
    savedTasks.forEach((savedTask) => {
        createTask(savedTask.text, savedTask);
    });
}

// Load tasks from local storage when the page loads
loadTasksFromLocalStorage();


// Event listener for adding a new task (with Enter key)
taskText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const taskName = taskText.value.trim();
        const dateName = '\n' + dateText.value.trim();
        if (taskName !== '') {
            createTask(taskName + dateName);
            taskText.value = '';
            dateText.value = '';
            saveTasksToLocalStorage(); // Save the new task to local storage
        }
    }
});
dateText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const taskName = taskText.value.trim();
        const dateName = '\n' + dateText.value.trim();
        if (taskName !== '') {
            createTask(taskName + dateName);
            taskText.value = '';
            dateText.value = '';
            saveTasksToLocalStorage(); // Save the new task to local storage
        }
    }
});

// Event listener for adding a new task (with the button)
addTaskButton.addEventListener('click', () => {
    const taskName = taskText.value.trim();
    const dateName = '\n' + dateText.value.trim();
    if (taskName !== '') {
        createTask(taskName + dateName);
        taskText.value = '';
        dateText.value = '';
        saveTasksToLocalStorage(); // Save the new task to local storage
    }
});
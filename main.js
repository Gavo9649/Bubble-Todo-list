// Select important DOM elements
const taskContainer = document.getElementById('taskContainer');
const taskText = document.getElementById('taskText');
const dateText = document.getElementById('dateText');
const addTaskButton = document.getElementById('addTaskButton');

const editTaskButton = document.getElementById('editTaskButton');
const deleteTaskButton = document.getElementById('deleteTaskButton')
const increaseSizeButton = document.getElementById('increaseSizeButton');
const decreaseSizeButton = document.getElementById('decreaseSizeButton');
editTaskButton.style.display = "none";
deleteTaskButton.style.display = "none";
increaseSizeButton.style.display = "none";
decreaseSizeButton.style.display = "none";


// Define a list of color presets
const colorPresets = ['#b92828a6', '#2830c1a6', '#1c9d29a6', '#10d3d398', '#ee1b88a3', '#aa3ee99f'];
let selectedCircle = null;
let isDragging = false; 

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
    if (savedAttributes){
        taskTextElement.textContent = text;    
    } else {
        taskTextElement.textContent = title + text;
    }

    // Append the task text to the task circle
    taskCircle.appendChild(taskTextElement);

    // Append the task circle to the task container
    taskContainer.appendChild(taskCircle);

    // Set initial circle size and text size
    let circleSize = 150; // Initial circle size
    const minCircleSize = 100; // Minimum circle size
    const maxCircleSize = 400; // Maximum circle size

    // Function to update the circle and text size
    function updateSize() {
        // Update the circle size with minimum and maximum limits
        circleSize = Math.min(maxCircleSize, Math.max(minCircleSize, circleSize));
        taskCircle.style.width = circleSize + 'px';
        taskCircle.style.height = circleSize + 'px';

        // Calculate the maximum text size as a percentage of the circle's radius
        const maxTextSize = circleSize * 0.1; // 40% of the circle's radius

        // Update the text size with minimum and maximum limits
        const minTextSize = 20; // Minimum text size

        const textSize = Math.min(maxTextSize, Math.max(minTextSize, maxTextSize));
        taskTextElement.style.fontSize = textSize + 'px';
    }

    // Add a wheel event listener to change the size on scroll
    taskCircle.addEventListener('wheel', (e) => {
        e.preventDefault();
        const scaleFactor = e.deltaY > 0 ? 0.975 : 1.025; // Adjust as needed

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

    // // Add a double click event listener to...
    taskCircle.addEventListener('click', () => {
        if (selectedCircle != taskCircle) {
            selectedCircle = taskCircle;
            taskCircle.style.outline = "4px solid black";
            editTaskButton.style.display = "block";
            deleteTaskButton.style.display = "block";
            increaseSizeButton.style.display = "block";
            decreaseSizeButton.style.display = "block";
        } else {
            selectedCircle = null;
            taskCircle.style.outline = "none";
            editTaskButton.style.display = "none";
            deleteTaskButton.style.display = "none";
            increaseSizeButton.style.display = "none";
            decreaseSizeButton.style.display = "none";
        }
        saveTasksToLocalStorage();
    });

    // Add a click event listener to handle click and change color
    taskCircle.addEventListener('dblclick', (e) => {
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
                    break;
                case '#2830c1a6': //blue
                    title = "Math 1513:\n";
                    break;
                case '#1c9d29a6': //green
                    title = "Chem 1515:\n";
                    break;
                case '#10d3d398': //light blue
                    title = "YSU 1500:\n";
                    break;
                case '#ee1b88a3': //pink-ish
                    title = "ENGR 1500:\n";
                    break;
                case '#aa3ee99f': //purple2
                    title = "HST 1500:\n";
                    break;
                default:
                    title = "Other:\n";
            }
            taskTextElement.textContent = title + taskTextElement.textContent.substring(taskTextElement.textContent.indexOf('\n') + 1, taskTextElement.textContent.length);
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

function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (elmnt) {
        elmnt.addEventListener('mousedown', dragMouseDown);
        elmnt.addEventListener('touchstart', dragTouchStart, { passive: false });
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function dragTouchStart(e) {
        const touch = e.targetTouches[0];
        pos3 = touch.clientX;
        pos4 = touch.clientY;
        document.addEventListener('touchend', closeDragElement, { passive: false });
        document.addEventListener('touchmove', elementDrag, { passive: false });
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        if (e.type === 'touchmove') {
            const touch = e.targetTouches[0];
            pos1 = pos3 - touch.clientX;
            pos2 = pos4 - touch.clientY;
            pos3 = touch.clientX;
            pos4 = touch.clientY;
        } else {
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
        }
        elmnt.style.top = (elmnt.offsetTop - pos2) + 'px';
        elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px';
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        document.removeEventListener('touchend', closeDragElement, { passive: false });
        document.removeEventListener('touchmove', elementDrag, { passive: false });
        saveTasksToLocalStorage();
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
    if (e.key === "Enter") {
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

editTaskButton.addEventListener('click', () => {
    const taskName = taskText.value.trim();
    const dateName = '\n' + dateText.value.trim();
    if (taskName !== '') {
        selectedCircle.querySelector('.task-text').textContent =  String(selectedCircle.querySelector('.task-text').textContent).substring(0, String(selectedCircle.querySelector('.task-text').textContent).indexOf("\n") + 1) + taskName + dateName;
        taskText.value = '';
        dateText.value = '';
        saveTasksToLocalStorage(); // Save the new task to local storage
    } else {
        if (selectedCircle) { 
            taskText.focus();
        } else {
            alert("Please select a task to edit.");
        }
    }
}); 
deleteTaskButton.addEventListener('click', () => {
    if (selectedCircle) {
        selectedCircle.remove();
        selectedCircle = null;
        editTaskButton.style.display = "none";
        deleteTaskButton.style.display = "none";
        saveTasksToLocalStorage(); // Save the updated tasks after removal
    } else {
        alert("Please select a task to delete.");
    }
});


document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' && selectedCircle) {
        selectedCircle.remove();
        selectedCircle = null;
        saveTasksToLocalStorage(); // Save the updated tasks after removal
    }
});


// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function () {
  // Function to track touch events
  var touchEventStart = null;
  var touchEventTimer = null;

  // Add event listener to capture taps
  document.addEventListener("touchstart", function (event) {
    var target = event.target;
    if (target.classList.contains("textbox")) {
      return; // Skip taps on existing text boxes
    }

    if (touchEventStart === null) {
      touchEventStart = Date.now();

      // Set a timer to clear the touch event after a certain duration
      touchEventTimer = setTimeout(function () {
        touchEventStart = null;
      }, 300); // Adjust the duration (in milliseconds) as needed
    } else {
      clearTimeout(touchEventTimer);
      touchEventStart = null;

      var x = event.touches[0].clientX;
      var y = event.touches[0].clientY;
      createTextBox(x, y, "");
    }
  });

  // Function to request camera permission
  function requestCameraPermission() {
    return new Promise(function (resolve, reject) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(function (stream) {
          resolve(stream);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }

  // Function to start the camera feed
  function startCameraFeed() {
    var video = document.getElementById("camera-feed");
    requestCameraPermission()
      .then(function (stream) {
        video.srcObject = stream;
        loadTextboxesFromLocalStorage();
      })
      .catch(function (error) {
        console.log("Error accessing webcam:", error);
      });
  }

  // Load text boxes from local storage
  function loadTextboxesFromLocalStorage() {
    var savedData = localStorage.getItem("clickData");
    if (savedData) {
      var elements = JSON.parse(savedData);
      elements.forEach(function (element) {
        createTextBox(element.x, element.y, element.content);
      });
    }
  }

  // Show instruction box
  function showInstructionBox() {
    var instructionBox = document.createElement("div");
    instructionBox.className = "instruction-box";
    var instructionText = document.createElement("div");
    instructionText.innerText = "Please follow the instructions:";
    instructionBox.appendChild(instructionText);
    var instructions = [
      "Step 1: Double-click anywhere to create a text box.",
      "Step 2: Type in the text box to enter content.",
      "Step 3: Drag and move the text box around.",
      "Step 4: Use the cross button to delete a text box.",
    ];
    var instructionList = document.createElement("ul");
    instructions.forEach(function (instruction) {
      var listItem = document.createElement("li");
      listItem.innerText = instruction;
      instructionList.appendChild(listItem);
    });
    instructionBox.appendChild(instructionList);
    var closeButton = document.createElement("button");
    closeButton.className = "instruction-close";
    closeButton.innerHTML = "&times;";
    closeButton.addEventListener("click", function () {
      document.body.removeChild(instructionBox);
      startCameraFeed(); // Start camera feed after closing instruction box
    });
    instructionBox.appendChild(closeButton);
    document.body.appendChild(instructionBox);
  }

  // Show prompt box for camera permission
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    var promptBox = document.createElement("div");
    promptBox.className = "prompt-box";
    var promptText = document.createElement("div");
    promptText.innerText =
      "🪞ACCOUNTABLITY MIRROR : \n\n This website wants to access your camera to render the mirror. This is completely safe as no data of camera footage is stored! We only store notes that you make and that too locally! Enjoy";
    promptBox.appendChild(promptText);
    var promptButtons = document.createElement("div");
    var allowButton = document.createElement("button");
    allowButton.innerText = "Allow";
    allowButton.className = "prompt-button";
    allowButton.addEventListener("click", function () {
      document.body.removeChild(promptBox);
      showInstructionBox(); // Show instruction box after granting camera permission
    });
    promptButtons.appendChild(allowButton);
    var denyButton = document.createElement("button");
    denyButton.innerText = "Deny";
    denyButton.className = "prompt-button";
    denyButton.addEventListener("click", function () {
      document.body.removeChild(promptBox);
      console.log("Camera permission denied");
    });
    promptButtons.appendChild(denyButton);
    promptBox.appendChild(promptButtons);
    document.body.appendChild(promptBox);
  } else {
    console.log("getUserMedia API not supported");
  }

  // Add event listener to move text box
  document.addEventListener("mousedown", function (event) {
    var target = event.target;
    if (target.classList.contains("textbox")) {
      var initialX = event.clientX;
      var initialY = event.clientY;
      var targetBox = target;

      function handleMouseMove(moveEvent) {
        var dx = moveEvent.clientX - initialX;
        var dy = moveEvent.clientY - initialY;

        targetBox.style.transform = `translate(${dx}px, ${dy}px)`;

        // Update the coordinates in the local storage
        var textBoxes = Array.from(document.getElementsByClassName("textbox"));
        var updatedData = textBoxes.map(function (textBox) {
          return {
            x: textBox.offsetLeft,
            y: textBox.offsetTop,
            content: textBox.querySelector(".textbox-input").value,
          };
        });
        localStorage.setItem("clickData", JSON.stringify(updatedData));
      }

      function handleMouseUp() {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      }

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
  });

  // Add event listener to capture double clicks
  document.addEventListener("dblclick", function (event) {
    var x = event.clientX;
    var y = event.clientY;
    createTextBox(x, y, "");
  });

  // Function to create a text box
  function createTextBox(x, y, content) {
    var textBox = document.createElement("div");
    textBox.className = "textbox";
    textBox.style.left = x + "px";
    textBox.style.top = y + "px";

    var input = document.createElement("textarea");
    input.className = "textbox-input";
    input.value = content;
    textBox.appendChild(input);

    var crossButton = document.createElement("button");
    crossButton.className = "textbox-cross";
    crossButton.innerText = "✖";
    crossButton.addEventListener("click", function () {
      textBox.parentNode.removeChild(textBox);
      updateLocalStorage();
    });
    textBox.appendChild(crossButton);

    document.body.appendChild(textBox);

    // Add event listener to update and store the text box content
    input.addEventListener("input", function () {
      updateLocalStorage();
    });

    // Focus the text box automatically
    input.focus();
  }

  // Function to update local storage with the current text boxes' data
  function updateLocalStorage() {
    var elements = Array.from(document.getElementsByClassName("textbox")).map(
      function (element) {
        return {
          x: element.offsetLeft,
          y: element.offsetTop,
          content: element.querySelector(".textbox-input").value,
        };
      }
    );
    localStorage.setItem("clickData", JSON.stringify(elements));
  }
});

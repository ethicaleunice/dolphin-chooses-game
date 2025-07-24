document.addEventListener('DOMContentLoaded', () => {
    // Get HTML elements
    const canvas = document.getElementById('gameWheel');
    const ctx = canvas.getContext('2d');
    const spinBtn = document.getElementById('spinButton');
    const resultDisplay = document.getElementById('result');

    // Define the game choices
    const games = [
        "Murder Mystery 2",
        "Piggy",
        "Flee the Facility",
        "SharkBite",
        "Doomspire Brick Battle",
        "Bloxburg"
    ];

    const numSegments = games.length;
    // Calculate the angle for each segment in radians (a full circle is 2*PI radians)
    const segmentAngle = (2 * Math.PI) / numSegments;

    // Colors for the wheel segments (sage green and white)
    const colors = ["#6B8E23", "#FFFFFF"];

    let currentRotation = 0; // Tracks the current rotation of the wheel
    let spinning = false;    // Flag to prevent multiple spins

    // Function to draw the wheel segments and text
    function drawWheel() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas before drawing

        for (let i = 0; i < numSegments; i++) {
            const startAngle = i * segmentAngle;
            const endAngle = (i + 1) * segmentAngle;

            // Draw the segment (pie slice)
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 10, startAngle, endAngle); // Outer arc
            ctx.lineTo(canvas.width / 2, canvas.height / 2); // Line to center
            ctx.closePath();

            ctx.fillStyle = colors[i % colors.length]; // Alternate colors (sage green, white, sage green, white...)
            ctx.fill(); // Fill the segment with its color
            ctx.strokeStyle = "#333"; // Outline color for segments
            ctx.lineWidth = 2;
            ctx.stroke(); // Draw the outline

            // Draw text (game name)
            ctx.save(); // Save the current canvas state (important for rotating text)
            ctx.translate(canvas.width / 2, canvas.height / 2); // Move origin to center of wheel
            ctx.rotate(startAngle + segmentAngle / 2); // Rotate to the middle of the current segment

            ctx.textAlign = "right"; // Align text to the right
            ctx.fillStyle = "#333"; // Text color (dark gray for readability)
            ctx.font = "bold 20px Arial"; // Font size and style for words (easily visible)

            // Adjust text position slightly in from the edge
            const textRadius = (canvas.width / 2) * 0.7;
            ctx.fillText(games[i], textRadius, 10); // Draw the game name

            ctx.restore(); // Restore the canvas state (undo the rotation for the next segment)
        }
    }

    // Function to handle the wheel spin when the button is clicked
    spinBtn.addEventListener('click', () => {
        if (spinning) return; // If already spinning, do nothing
        spinning = true;
        resultDisplay.textContent = ''; // Clear any previous winning message

        // Calculate a random number of degrees for the wheel to spin
        // It ensures at least 5 full rotations (360 * 5) and up to 8 full rotations (360 * 8)
        const minDegrees = 360 * 5;
        const maxDegrees = 360 * 8;
        const randomDegrees = Math.floor(Math.random() * (maxDegrees - minDegrees + 1)) + minDegrees;

        // Add the random spin to the wheel's current rotation
        const finalRotation = currentRotation + randomDegrees;
        // Apply the rotation to the canvas element using CSS transform
        // The CSS 'transition' property makes this rotation smooth
        canvas.style.transform = `rotate(${finalRotation}deg)`;

        // Listen for when the CSS transition (the spinning animation) finishes
        canvas.addEventListener('transitionend', () => {
            spinning = false; // Allow spinning again
            currentRotation = finalRotation % 360; // Update current rotation for the next spin

            // --- Logic to determine which segment landed under the pointer ---
            // The pointer is visually at the top (0 degrees or 360 degrees on a circle).
            // Canvas drawing starts from the right (0 degrees) and goes clockwise.
            // We adjust the final rotation to align with the pointer's position (top = -90 degrees or 270 degrees from 0-right).
            const adjustedRotationForPointer = (360 - (finalRotation % 360) + 270) % 360;

            // Calculate which segment index it landed on based on the adjusted rotation
            // Divide the adjusted rotation by the degree value of each segment
            const segmentDegree = segmentAngle * 180 / Math.PI; // Convert segment angle from radians to degrees
            const landedSegmentIndex = Math.floor(adjustedRotationForPointer / segmentDegree);

            // The 'games' array order needs to be reverse-mapped because of how the segments are drawn
            // and how the pointer aligns. This formula corrects it.
            const actualWinningIndex = (numSegments - 1 - landedSegmentIndex + numSegments) % numSegments;

            resultDisplay.textContent = `You should play: ${games[actualWinningIndex]}!`;

        }, { once: true }); // The { once: true } ensures this event listener only runs once per spin
    });

    // Initial drawing of the wheel when the page loads
    drawWheel();
});

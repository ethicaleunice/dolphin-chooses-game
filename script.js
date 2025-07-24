document.addEventListener('DOMContentLoaded', () => {
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
    const segmentAngle = (2 * Math.PI) / numSegments; // Angle for each segment in radians

    // Colors for the wheel segments (sage green and white)
    const colors = ["#6B8E23", "#FFFFFF"]; // Sage green, White

    let currentRotation = 0; // Tracks the current rotation of the wheel
    let spinning = false; // Flag to prevent multiple spins

    // Function to draw the wheel
    function drawWheel() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

        for (let i = 0; i < numSegments; i++) {
            const startAngle = i * segmentAngle;
            const endAngle = (i + 1) * segmentAngle;

            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 10, startAngle, endAngle);
            ctx.lineTo(canvas.width / 2, canvas.height / 2); // Draw line to center
            ctx.closePath();

            ctx.fillStyle = colors[i % colors.length]; // Alternate colors
            ctx.fill();
            ctx.strokeStyle = "#333"; // Outline color for segments
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw text (game name)
            ctx.save(); // Save the current drawing state
            ctx.translate(canvas.width / 2, canvas.height / 2); // Move origin to center
            ctx.rotate(startAngle + segmentAngle / 2); // Rotate to the middle of the segment

            ctx.textAlign = "right"; // Align text to the right
            ctx.fillStyle = "#333"; // Text color (dark gray for readability)
            ctx.font = "bold 20px Arial"; // Font size and style for words

            // Adjust text position
            const textRadius = (canvas.width / 2) * 0.7; // Position text closer to the edge
            ctx.fillText(games[i], textRadius, 10); // Draw text

            ctx.restore(); // Restore the drawing state
        }
    }

    // Function to spin the wheel
    spinBtn.addEventListener('click', () => {
        if (spinning) return; // Don't spin if already spinning
        spinning = true;
        resultDisplay.textContent = ''; // Clear previous result

        // Calculate a random degree to stop on
        const minDegrees = 360 * 5; // Minimum 5 full rotations
        const maxDegrees = 360 * 8; // Maximum 8 full rotations
        const randomDegrees = Math.floor(Math.random() * (maxDegrees - minDegrees + 1)) + minDegrees;

        // Determine which segment it will land on
        const finalRotation = currentRotation + randomDegrees;
        canvas.style.transform = `rotate(${finalRotation}deg)`;

        // Calculate which segment index it will land on
        const totalRotationNormalized = finalRotation % 360;
        const segmentDegree = 360 / numSegments;
        // Invert for wheel spin logic: 0 degrees is top, spinning clockwise
        const landingIndex = Math.floor((360 - (totalRotationNormalized % 360) + (segmentDegree / 2)) % 360 / segmentDegree);
        // This calculation is tricky because 0 degrees is typically right, but visually we want the pointer at the top.
        // We'll adjust the 'landingIndex' to correctly map to our array.
        // A simpler way for a newbie is to let it land and then calculate which segment is "under" the pointer.
        // For now, let's just make sure the rotation looks good.

        // The transition in CSS handles the smooth animation.
        // We need to wait for the animation to complete to get the result.
        canvas.addEventListener('transitionend', () => {
            spinning = false;
            currentRotation = finalRotation % 360; // Keep track of the actual current rotation for next spin

            // Determine the winning segment more reliably after the spin
            // The pointer is at 0 degrees (top).
            // Segments are drawn starting from 0 (right) clockwise.
            // We need to find which segment's middle is closest to the pointer.

            // Get the current rotation in degrees, normalized to 0-360, relative to the top (pointer)
            let normalizedRotationAtPointer = (360 - (currentRotation % 360) + 90) % 360; // Add 90 to align with top for segment calculation

            let winningIndex = -1;
            for (let i = 0; i < numSegments; i++) {
                const segmentStartDegree = (i * segmentAngle * 180 / Math.PI);
                const segmentEndDegree = ((i + 1) * segmentAngle * 180 / Math.PI);

                // Check if the pointer (at 0 degrees) is within the segment's arc
                // This logic can be tricky with wrap-around, simplified for direct calculation:
                if (normalizedRotationAtPointer >= segmentStartDegree && normalizedRotationAtPointer < segmentEndDegree) {
                     winningIndex = i;
                     break;
                }
            }
            
            // A more robust way to find the winning segment (relative to the pointer at the top)
            // The canvas rotation starts from the right (0 degrees).
            // The pointer is at the top (visually -90 degrees or 270 degrees from 0).
            // To figure out which segment landed at the top, we need to adjust the rotation.
            // The total angle for all segments is 360 degrees.
            // Each segment covers `segmentAngle` (in radians).
            // `segmentDegree` is `segmentAngle` in degrees.
            const adjustedRotationForPointer = (360 - (finalRotation % 360) + 270) % 360; // +270 or -90 to align 0 with the pointer
            const landedSegmentIndex = Math.floor(adjustedRotationForPointer / (segmentAngle * 180 / Math.PI));

            // Ensure the index is within bounds and adjust if necessary for array mapping
            const actualWinningIndex = (numSegments - 1 - landedSegmentIndex + numSegments) % numSegments; // Reverse and adjust for array order

            resultDisplay.textContent = `You should play: ${games[actualWinningIndex]}!`;

        }, { once: true }); // Ensure the event listener runs only once
    });

    // Initial draw of the wheel
    drawWheel();
});
let model;

async function setupFacemesh() {
    model = await facemesh.load();
    predict();
}

async function predict() {
    const video = document.getElementById('localVideo');
    const predictions = await model.estimateFaces(video);

    if (predictions.length > 0) {
        const keypoints = predictions[0].scaledMesh;
        const leftEye = keypoints[263]; // Левый глаз
        const rightEye = keypoints[33]; // Правый глаз

        const leftEyeClosed = isEyeClosed(leftEye, keypoints);
        const rightEyeClosed = isEyeClosed(rightEye, keypoints);

        if (leftEyeClosed && rightEyeClosed) {
            alert("Вы закрыли глаза!");
        } else if (isLookingAway(leftEye, rightEye)) {
            alert("Пожалуйста, смотрите в камеру!");
        }
    }

    requestAnimationFrame(predict);
}

function isEyeClosed(eyePoint, keypoints) {
    const upperLid = keypoints[159]; // Верхнее веко
    const lowerLid = keypoints[145]; // Нижнее веко

    const distance = Math.abs(upperLid[1] - lowerLid[1]);
    return distance < 5; // Пороговое значение для закрытого глаза
}

function isLookingAway(leftEye, rightEye) {
    const eyeDirection = (leftEye[0] + rightEye[0]) / 2;
    const faceCenter = (leftEye[0] + rightEye[0]) / 2;

    const threshold = 10; // Пороговое значение для отклонения взгляда
    return Math.abs(eyeDirection - faceCenter) > threshold;
}

setupFacemesh();

startButton.onclick = async () => {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: true
        });
        localVideo.srcObject = localStream;
        localVideo.style.transform = 'scaleX(-1)';

        // Инициализация Facemesh после получения доступа к камере
        setupFacemesh();

        // Остальной код для установки соединения...
    } catch (error) {
        console.error('Ошибка при получении медиапотока:', error);
    }
};

const warningMessage = document.createElement('div');
warningMessage.style.position = 'fixed';
warningMessage.style.bottom = '20px';
warningMessage.style.right = '20px';
warningMessage.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
warningMessage.style.color = 'white';
warningMessage.style.padding = '10px';
warningMessage.style.borderRadius = '5px';
warningMessage.style.display = 'none';
document.body.appendChild(warningMessage);

function showWarning(message) {
    warningMessage.textContent = message;
    warningMessage.style.display = 'block';
    setTimeout(() => {
        warningMessage.style.display = 'none';
    }, 3000);
}

// Замените alert на showWarning
if (leftEyeClosed && rightEyeClosed) {
    alert("Вы закрыли глаза!");
} else if (isLookingAway(leftEye, rightEye)) {
    alert("Пожалуйста, смотрите в камеру!");
}


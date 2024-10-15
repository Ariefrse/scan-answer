let isSelecting = false;
let startX, startY, endX, endY;
let selectionBox;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "scanText") {
    isSelecting = true;
    document.body.style.cursor = 'crosshair';
    createSelectionBox();
    document.addEventListener('mousedown', startSelection);
    document.addEventListener('mousemove', updateSelection);
    document.addEventListener('mouseup', endSelection);
  }
});

function createSelectionBox() {
  selectionBox = document.createElement('div');
  selectionBox.style.position = 'fixed';
  selectionBox.style.border = '2px solid #007bff';
  selectionBox.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
  selectionBox.style.pointerEvents = 'none';
  selectionBox.style.display = 'none';
  document.body.appendChild(selectionBox);
}

function startSelection(e) {
  if (!isSelecting) return;
  startX = e.clientX;
  startY = e.clientY;
  selectionBox.style.display = 'block';
}

function updateSelection(e) {
  if (!isSelecting || !startX) return;
  endX = e.clientX;
  endY = e.clientY;
  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);
  selectionBox.style.left = left + 'px';
  selectionBox.style.top = top + 'px';
  selectionBox.style.width = width + 'px';
  selectionBox.style.height = height + 'px';
}

function endSelection(e) {
  if (!isSelecting) return;
  isSelecting = false;
  document.body.style.cursor = 'default';
  document.removeEventListener('mousedown', startSelection);
  document.removeEventListener('mousemove', updateSelection);
  document.removeEventListener('mouseup', endSelection);

  const selectedText = getTextFromArea(startX, startY, endX, endY);
  selectionBox.style.display = 'none';
  chrome.runtime.sendMessage({action: "textSelected", text: selectedText});
}

function getTextFromArea(startX, startY, endX, endY) {
  const range = document.caretRangeFromPoint(startX, startY);
  const endRange = document.caretRangeFromPoint(endX, endY);
  if (range && endRange) {
    range.setEnd(endRange.endContainer, endRange.endOffset);
    return range.toString();
  }
  return '';
}
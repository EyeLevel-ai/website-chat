try {
  var wssURL = 'wss://ws.eyelevel.ai';
  var devURL = 'wss://dws.eyelevel.ai';
  var whiteSpace = /^\s+|\s+$|\s+(?=\s)/g;
  var aiMessages = {};
  var userScrolledUp = false;
  var originalWsResText = "";

  var mdConverter;
  if (parent && parent.window && parent.window.showdown && parent.window.showdown.Converter) {
    mdConverter = new parent.window.showdown.Converter({
      disableForced4SpacesIndentedSublists: true,
      openLinksInNewWindow: true,
      tables: true,
      simpleLineBreaks: true,
      smartIndentationFix: true,
    });
  }

  var hasInit = false;
  var hasInitMenu = false;
  var xrayIsOpen = false;
  var previousMessageContainerId = null;

  // FILE UPLOADER CODE
  // {file: File, status:  "pending" | "uploading" | "uploaded", uploadedFileURL: string }[]
  window.selectedFiles = []; 

  var uploadButton = document.getElementById('uploadButton');
  var fileUploader = document.getElementById('fileUploader');
  var fileContainer = document.getElementById('fileContainer');
  var eyInputContainer = document.getElementById('ey_input_container');
  var fileErrorMessage = document.getElementById('fileErrorMessage');

  uploadButton.addEventListener('click', function () {
    fileUploader.click();
  });

  fileUploader.addEventListener('change', function (event) {
    var files = event.target.files;
    handleFiles(files);
  });

  eyInputContainer.addEventListener('dragover', function (event) {
    if (window.eysources.includes("xray-thumbnails")) return;

    event.preventDefault();
    eyInputContainer.classList.add('dragover');
  });

  eyInputContainer.addEventListener('dragleave', function (event) {
    if (window.eysources.includes("xray-thumbnails")) return;

    eyInputContainer.classList.remove('dragover');
  });

  eyInputContainer.addEventListener('drop', function (event) {
    if (window.eysources.includes("xray-thumbnails")) return;

    event.preventDefault();
    eyInputContainer.classList.remove('dragover');
    var files = event.dataTransfer.files;
    handleFiles(files);
  });

  function generateRandom10DigitNumber() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }

  function fetchImage(file) {
    var fileType = file.name.split('.').pop().toLowerCase();
    var mimeType = file.type;
    var randomFileName = generateRandom10DigitNumber();

    return fetch('https://api.eyelevel.ai/upload/file?name=' + randomFileName + '&type=' + fileType)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        var URL = data.URL;
        return fetch(decodeURI(URL), {
          method: 'PUT',
          body: file,
          headers: new Headers({
            'Content-Type': mimeType,
          }),
        });
      })
      .then(function (uploadResponse) {
        if (uploadResponse.status !== 200) {
          throw new Error('Upload failed');
        }
        return 'https://upload.eyelevel.ai/file/' + randomFileName + '.' + fileType;
      })
      .catch(function () {
        return null;
      });
  }

  function handleFiles(files) {
    var allowedExtensions = ['png', 'jpeg', 'jpg', 'webp'];
    var maxFileSize = 20 * 1024 * 1024; // 20MB in bytes
    var maxFilesCount = 10;

    var filesArray = Array.from(files);

    filesArray = filesArray.filter(function (newFile) {
      return !window.selectedFiles.some(function (existingFileItem) {
        var existingFile = existingFileItem.file;
        return (
          existingFile.name === newFile.name &&
          existingFile.size === newFile.size &&
          existingFile.lastModified === newFile.lastModified
        );
      });
    });

    if (window.selectedFiles.length + filesArray.length > maxFilesCount) {
      showErrorMessage('max 10 files');
      return;
    }

    for (var i = 0; i < filesArray.length; i++) {
      var file = filesArray[i];
      var fileExtension = file.name.split('.').pop().toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        showErrorMessage('support only: .png, .jpeg, .jpg, .webp');
        continue;
      }

      if (file.size > maxFileSize) {
        showErrorMessage('file size 20MB max per image');
        continue;
      }

      window.selectedFiles.push({ file: file, status: 'pending' });
    }

    if (window.selectedFiles.length > 0) {
      eyInputContainer.classList.remove('ey_input');
      eyInputContainer.classList.add('ey_input_with_files');
    } else {
      eyInputContainer.classList.remove('ey_input_with_files');
      eyInputContainer.classList.add('ey_input');
    }

    renderFiles();
    uploadFiles();
  }

  function uploadFiles() {
    window.selectedFiles.forEach(fileItem => {
      if (fileItem.status === 'pending') {
        uploadFile(fileItem);
      }
    });
  }

  function uploadFile(fileItem) {
    fileItem.status = 'uploading';
    renderFiles();

    fetchImage(fileItem.file)
      .then(function (uploadedFileURL) {
        if (uploadedFileURL) {
          fileItem.status = 'uploaded';
          fileItem.uploadedURL = uploadedFileURL;
        } else {
          fileItem.status = 'error';
        }
        renderFiles();
      })
      .catch(function () {
        fileItem.status = 'error';
        renderFiles();
      });
  }

  function renderFiles() {
    if (!fileErrorMessage.innerText && window.selectedFiles && !window.selectedFiles.length) {
      eyInputContainer.classList.remove('ey_input_with_files');
      eyInputContainer.classList.add('ey_input');
    }

    fileContainer.innerHTML = '';
    window.selectedFiles.forEach((fileItem, index) => {
      const file = fileItem.file;

      const fileItemDiv = document.createElement('div');
      fileItemDiv.classList.add('file-item');

      const fileIcon = document.createElement('div');
      fileIcon.classList.add('file-icon');

      if (fileItem.status === 'uploading') {
        fileIcon.classList.add('loading');
      } else if (fileItem.status === 'uploaded') {
        fileIcon.innerHTML = '📄';
      } else if (fileItem.status === 'error') {
        fileIcon.innerHTML = '❌';
      } else {
        fileIcon.innerHTML = '📄';
      }

      const fileDetails = document.createElement('div');
      fileDetails.classList.add('file-details');
      fileDetails.innerHTML = `<strong>${file.name}</strong><br><span>${file.name
        .split('.')
        .pop()}</span>`;

      const removeBtn = document.createElement('button');
      removeBtn.classList.add('remove-file-btn');
      removeBtn.innerHTML = '✕';
      removeBtn.onclick = () => removeFile(index);

      fileItemDiv.appendChild(fileIcon);
      fileItemDiv.appendChild(fileDetails);
      fileItemDiv.appendChild(removeBtn);

      fileContainer.appendChild(fileItemDiv);
    });
  }

  function removeFile(index) {
    window.selectedFiles.splice(index, 1);
    renderFiles();
  }

  function showErrorMessage(message) {
    setTimeout(function () {
      eyInputContainer.classList.remove('ey_input');
      eyInputContainer.classList.add('ey_input_with_files');
    }, 0);

    if (fileErrorMessage) {
      fileErrorMessage.innerText = message;
      fileErrorMessage.style.display = 'block';

      setTimeout(function () {
        if (window.selectedFiles && !window.selectedFiles.length) {
          eyInputContainer.classList.remove('ey_input_with_files');
          eyInputContainer.classList.add('ey_input');
        }

        fileErrorMessage.innerText = '';
        fileErrorMessage.style.display = 'none';
      }, 3000);
    }
  }

  function initModal() {
    var modalContainer = document.createElement('div');
    modalContainer.className = "modal-container";
    modalContainer.id = "eyModal";
    modalContainer.style = "display: none;position: fixed; z-index: 9999;left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0, 0, 0, 0.5);"
    
    var modalContent = document.createElement('div');
    modalContent.className = "modal-content";

    var modalTopRow = document.createElement('div');
    modalTopRow.className = "modal-top-row";

    var modalUrl = document.createElement('div');
    modalUrl.id = "modal-url";
    modalUrl.classList.add('modal-url-container');

    var modalClose = document.createElement('div');
    modalClose.id = "modal-close";
    modalClose.className = "close";
    modalClose.innerHTML = "&#x2715;"

    var modalText = document.createElement('div');
    modalText.id = "modal-text";
    modalText.className = "modal-text";
    modalText.style = "margin-top: 16px;margin-bottom: 5px;font-size: 1.0rem; word-break: break-word;"
     
    modalTopRow.appendChild(modalUrl);
    modalTopRow.appendChild(modalClose)

    modalContent.appendChild(modalTopRow)
    modalContent.appendChild(modalText)

    modalContainer.appendChild(modalContent)
    
    var eyChat = document.getElementById('eyChat');
    if (eyChat) {
      eyChat.appendChild(modalContainer);
    }
  };
  initModal();

  var svgExternalLink = `<svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="30"
      height="12"
      fill="#4f4f4f"
      viewBox="0 0 44 44">
        <path d="M 40.960938 4.9804688 A 2.0002 2.0002 0 0 0 40.740234 5 L 28 5 A 2.0002 2.0002 0 1 0 28 9 L 36.171875 9 L 22.585938 22.585938 A 2.0002 2.0002 0 1 0 25.414062 25.414062 L 39 11.828125 L 39 20 A 2.0002 2.0002 0 1 0 43 20 L 43 7.2460938 A 2.0002 2.0002 0 0 0 40.960938 4.9804688 z M 12.5 8 C 8.3826878 8 5 11.382688 5 15.5 L 5 35.5 C 5 39.617312 8.3826878 43 12.5 43 L 32.5 43 C 36.617312 43 40 39.617312 40 35.5 L 40 26 A 2.0002 2.0002 0 1 0 36 26 L 36 35.5 C 36 37.446688 34.446688 39 32.5 39 L 12.5 39 C 10.553312 39 9 37.446688 9 35.5 L 9 15.5 C 9 13.553312 10.553312 12 12.5 12 L 22 12 A 2.0002 2.0002 0 1 0 22 8 L 12.5 8 z">
      </path>
  </svg>`;

  var zoomOutBtn = document.createElement('button');
  zoomOutBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="7" y1="11" x2="15" y2="11"></line>
      <line x1="16.5" y1="16.5" x2="22" y2="22"></line>
    </svg>`;
  var resetZoomBtn = document.createElement('button');
  resetZoomBtn.innerHTML = `
    <svg  fill="none" stroke="#fff" width="22" height="22" viewBox="0 0 24 24">
      <path fill="#fff" d="M5 15H3v4c0 1.1.9 2 2 2h4v-2H5zM5 5h4V3H5c-1.1 0-2 .9-2 2v4h2zm14-2h-4v2h4v4h2V5c0-1.1-.9-2-2-2m0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4m0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2">
      </path>
    </svg>
  `;
  var zoomInBtn = document.createElement('button');
  zoomInBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="11" y1="7" x2="11" y2="15"></line>
      <line x1="7" y1="11" x2="15" y2="11"></line>
      <line x1="16.5" y1="16.5" x2="22" y2="22"></line>
    </svg>`;

  var urlRegex = new RegExp(/(?:https?|ftp):\/\/(?:www\.)?[a-zA-Z0-9][a-zA-Z0-9-]{0,255}(\.[a-zA-Z0-9-]{2,})+\b([\-a-zA-Z0-9()@:%_\+.~#?&//=]*)(?<![()\]\.]|\.\.\.)/g);

  function escapeAndDecorateString(txt, isStreaming) {
    if (isStreaming) {
      return escapeAndDecorateStreamingString(txt);
    }

    var match = ''; var splitText = ''; var startIndex = 0;
    while ((match = urlRegex.exec(txt)) != null) {
      var rawTxt = txt.substr(startIndex, (match.index - startIndex));
      rawTxt = rawTxt && rawTxt.toString() ? rawTxt.toString().replace(/&/g, "&amp").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;") : rawTxt;
      splitText += rawTxt;
      var cleanedLink = txt.substr(match.index, (match[0].length));
      splitText += '<a href="' + cleanedLink + '" target="_blank">' + cleanedLink + '</a>';
      startIndex = match.index + (match[0].length);
    }
    if (startIndex < txt.length) {
      var rawTxt = txt.substr(startIndex);
      if (!isStreaming) {
        rawTxt = rawTxt && rawTxt.toString() ? rawTxt.toString().replace(/&/g, "&amp").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;") : rawTxt; 
      }                   
      splitText += rawTxt;
    }
    return splitText;
  }

  function reformatMarkdownLists(markdownText) {
    var lines = markdownText.split('\n');
    var hasIndents = false
    var reformattedLines = [];
    var indentStack = [];

    for (var idx = 0; idx < lines.length; idx++) {
        if (hasIndents) {
            break;
        }

        var line = lines[idx];
        var trimmedLine = line.trim();

        var listMatch = trimmedLine.match(/^(\d+\.|\*|\-) /);
        if (!listMatch) {
            reformattedLines.push(line);
            continue;
        }

        var currentIndent = line.search(/\S|$/);
        if (currentIndent > 0) {
            hasIndents = true;
            break;
        }

        var listItem = listMatch[0];

        var listChar = "";
        if (/^\d+\./.test(listItem)) {
            listChar = "n";
        } else if (/^\*/.test(listItem)) {
            listChar = "*";
        } else if (/^\-/.test(listItem)) {
            listChar = "-";
        }

        if (listChar === "") {
            reformattedLines.push(line);
            continue;
        }

        var foundChar = false;
        var indents = 0;
        for (var j = 0; j < indentStack.length; j++) {
            if (listChar === indentStack[j]) {
                foundChar = true;
                indents = j;
                var total = indentStack.length;
                for (var k = j+1; k < total; k++) {
                    indentStack.pop();
                }
                break;
            }
        }

        if (!foundChar) {
            indentStack.push(listChar);
            indents = indentStack.length - 1;
        }

        if (indents > 0) {
            var indent = "";
            for (var j = 0; j < indents; j++) {
                indent += "    ";
            }
            reformattedLines.push(indent + line);
        } else {
            reformattedLines.push(line);
        }
    }

    if (hasIndents) {
        return markdownText;
    }

    return reformattedLines.join('\n');
}
  
  function escapeAndDecorateStreamingString(txt) {
    var markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
    var match = '';
    var startIndex = 0;
    var splitText = '';
    var isInsideMarkdownLink = false;
    
    while ((match = urlRegex.exec(txt)) != null) {
        var rawTxt = txt.substr(startIndex, (match.index - startIndex));

        var markdownMatch = markdownLinkRegex.exec(txt);
        if (markdownMatch && markdownMatch.index < match.index && markdownMatch.index + markdownMatch[0].length >= match.index + match[0].length) {
            isInsideMarkdownLink = true;
        } else {
            isInsideMarkdownLink = false;
        }

        if (!isInsideMarkdownLink) {
            splitText += rawTxt;
            var cleanedLink = txt.substr(match.index, (match[0].length));
            splitText += '<a href="' + cleanedLink + '" target="_blank">' + cleanedLink + '</a>';
        } else {
            splitText += txt.substr(startIndex, match.index + match[0].length - startIndex);
        }

        startIndex = match.index + (match[0].length);
    }

    splitText += txt.substr(startIndex);

    return reformatMarkdownLists(splitText);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { escapeAndDecorateString };
  }

  function externalLinkIcon() {
      var d = document.createElement("div");
      d.classList.add('link-button');
      d.innerHTML = svgExternalLink;
      return d;
  };

  function createHeaderElement(config) {
      var h = document.createElement(config.h);
      h.innerText = config.innerText;
      h.className = config.className;
      return h;
  };
  
  function createDivElement(config) {
      var div = document.createElement("div");
      div.id = config.id;
      div.className = config.className;
      return div;
  };
  
  function linkItemComponent(num, link, name) {
      // link-item
      var linkItem = document.createElement("div");
      linkItem.className = "link-item";
   
      // link-number
      var linkNumber = document.createElement("div");
      linkNumber.className = "link-number";
      linkNumber.textContent = num;
  
      //link-text
      var txt = link;
      if (name) {
        txt = decodeURIComponent(decodeURIComponent(name));
      }
      var linkText = document.createElement("div");
      linkText.className = "link-text";
      linkText.textContent = txt;
  
      // fill component;
      linkItem.appendChild(linkNumber);
      linkItem.appendChild(linkText)
  
      return linkItem;
  };

  function openSourceLinkInModal(url, text, index) {
    var eyModal = document.getElementById("eyModal"); 
    var modalUrlDiv = document.getElementById("modal-url"); 
    var modalText = document.getElementById("modal-text"); 
    var closeModal = document.getElementById("modal-close"); 

    closeModal.onclick = function() {
      modalUrlDiv.innerHTML = "";
      modalText.innerHTML = "";
      eyModal.style.display = "none";
    }
   
    var link = linkItemComponent(index, url);
    var icon = externalLinkIcon()
    link.appendChild(icon)
    link.onclick = function() {
      window.open(url, '_blank')
    }


    modalUrlDiv.appendChild(link);
    modalText.innerText = text;
    eyModal.style.display = "block";
    return;
  };

  function openSourceLinkInSideBar (url, text, index, messageContainerId) {
    var isSideBarIsOpen = document.getElementById("side-bar-" + messageContainerId);
    if (isSideBarIsOpen) {
      isSideBarIsOpen.remove();
    }

    var messageContainer = document.querySelector('[data-turn-uuid="' + messageContainerId  +'"]');
   
    var serverResponse = document.getElementById("static-" + messageContainerId);
    if (serverResponse) {
      serverResponse.style = "flex: 1";
    } else {
      var serverResponseStream = document.getElementById("stream-" + messageContainerId);
      serverResponseStream.style = "flex: 1";
    }
   
    var sideBar = createDivElement({id: "side-bar-" + messageContainerId, className: "source-sideBar"});
    var sideBarTopRow = document.createElement("div");
    sideBarTopRow.classList.add('side-bar-container');

    var sideBarClose = document.createElement("div");
    sideBarClose.classList.add('side-bar-close');
    sideBarClose.innerHTML = "&#x2715;";
    sideBarClose.onclick = function() {
      var sideBar = document.getElementById("side-bar-" + messageContainerId);;
      sideBar.remove();
    };

    var link = linkItemComponent(index, url);
    var icon = externalLinkIcon()
    link.appendChild(icon)
    link.onclick = function() {
      window.open(url, '_blank')
    }

    sideBarTopRow.appendChild(link);
    sideBarTopRow.appendChild(sideBarClose)

    var textDiv = createDivElement({id: "", className: ""});
    textDiv.classList.add('side-bar-text');
    textDiv.innerText = text;

    sideBar.appendChild(sideBarTopRow);
    sideBar.appendChild(textDiv);
    messageContainer.append(sideBar);
  }

  function removeActiveThumbnail() {
    var thumbnails = document.querySelectorAll(".thumbnail-item.active");
    var nonPdfThumbnails = document.querySelectorAll(".thumbnail-non-pdf-item.active");
    if (thumbnails && thumbnails.length > 0) {
      thumbnails.forEach(thumb => {
        thumb.classList.remove("active");
      });
    }

    if (nonPdfThumbnails && nonPdfThumbnails.length > 0) {
      nonPdfThumbnails.forEach(thumb => {
        thumb.classList.remove("active");
      });
    }
  }

  function thumbnailsItemComponent(link, fileName) {
    var tooltip = document.createElement("div");
    tooltip.className = "custom-tooltip";
    tooltip.textContent = fileName;

    var container = document.createElement("div");
    container.className = "thumbnail-container";
    container.style.position = "relative";
    container.style.display = "inline-block";

    if (link) {
      var img = document.createElement("img");
      img.src = link;
      img.width = 80;
      img.height = 100;
      img.className = "thumbnail-item";
      container.appendChild(img);
    } else {
      var fileType = getFileType(fileName);
      var fileIcon = document.createElement("div");
      fileIcon.innerHTML = MAP_FILE_TYPE_TO_SVG[fileType];
      fileIcon.className = "thumbnail-non-pdf-item";
      container.appendChild(fileIcon);
    }

    // Append the tooltip to the container
    container.appendChild(tooltip);

    // Show/hide tooltip on hover
    container.addEventListener("mouseenter", () => {
      tooltip.style.display = "block";
    });
    container.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });

    return container;
  }

  function xrayLinkButton(documentId, isNonXrayDocument) {
    if (isNonXrayDocument) {
      var span = document.createElement("span");
      return span;
    }

    var url = "https://dashboard.groundx.ai/xray/" + documentId;

    switch (window.eyEnv) {
      case "dev":
      case "local":
      case "local-chat-dev":
      case "local-css-dev":
      case "local-dev":
        url = "https://devdashboard.groundx.ai/xray/" + documentId;
        break;
    }

    // Create the text link
    var button = document.createElement("button");
    button.classList.add("xray-header-button");
    button.textContent = "FULL X-RAY";
    button.onclick = function () {
      window.open(url, "_blank");
    };

    return button;
  }

  function xraySourceLinkButton(fileUrl, pageNumber) {
    var button = document.createElement("button");
    button.classList.add("xray-header-button");
    button.textContent = "SOURCE FILE";

    button.onclick = function () {
      var url = new URL(fileUrl);
      var pathSegments = url.pathname.split("/");
      var fileName = pathSegments[pathSegments.length - 1];

      var fileExtension = fileName.split(".").pop().toLowerCase();
      var viewableFileTypes = ["pdf", "png", "jpeg", "jpg", "txt", "json"];
      var newWindow = null;

      if (viewableFileTypes.includes(fileExtension)) {
        newWindow = window.open("", "_blank");
      }

      var steps = [
        function () {
          // Step 1: Try file URL as is
          return url.href;
        },
        function () {
          // Step 2: Encode the file name and use it with the original URL
          var encodedFileName = encodeURIComponent(fileName);
          var newUrl = new URL(url.href);
          var pathSegments = newUrl.pathname.split("/");
          pathSegments[pathSegments.length - 1] = encodedFileName;
          newUrl.pathname = pathSegments.join("/");
          return newUrl.href;
        },
        function () {
          // Step 3: Double-encode the file name and use it with the URL
          var doubleEncodedFileName = encodeURIComponent(encodeURIComponent(fileName));
          var newUrl = new URL(url.href);
          var pathSegments = newUrl.pathname.split("/");
          pathSegments[pathSegments.length - 1] = doubleEncodedFileName;
          newUrl.pathname = pathSegments.join("/");
          return newUrl.href;
        },
        function () {
          // Step 4: Decode the original file name and use it with the URL
          var decodedFileName = decodeURIComponent(fileName);
          var newUrl = new URL(url.href);
          var pathSegments = newUrl.pathname.split("/");
          pathSegments[pathSegments.length - 1] = decodedFileName;
          newUrl.pathname = pathSegments.join("/");
          return newUrl.href;
        },
        function () {
          // Step 5: Double-decode the file name and use it with the URL
          var doubleDecodedFileName = decodeURIComponent(decodeURIComponent(fileName));
          var newUrl = new URL(url.href);
          var pathSegments = newUrl.pathname.split("/");
          pathSegments[pathSegments.length - 1] = doubleDecodedFileName;
          newUrl.pathname = pathSegments.join("/");
          return newUrl.href;
        },
      ];

      var stepIndex = 0;
      var originalText = button.textContent;

      button.textContent = "Loading...";
      button.disabled = true;

      function tryNextStep() {
        if (stepIndex >= steps.length) {
          button.textContent = "Failed to open";
          button.disabled = false;

          if (newWindow) {
            newWindow.close();
          }

          setTimeout(function () {
            button.textContent = originalText;
          }, 2000);
          return;
        }

        var modifiedUrl = steps[stepIndex]();

        fetch(modifiedUrl, { method: "HEAD" })
          .then(function (response) {
            if (response.ok) {
              if (viewableFileTypes.includes(fileExtension)) {
                if (fileExtension === "pdf") {
                  newWindow.location.href = modifiedUrl + "#page=" + pageNumber;
                } else {
                  newWindow.location.href = modifiedUrl;
                }
              } else {
                var anchor = document.createElement("a");
                anchor.href = modifiedUrl;
                anchor.download = fileName;
                document.body.appendChild(anchor);
                anchor.click();
                document.body.removeChild(anchor);
              }

              button.textContent = originalText;
              button.disabled = false;
            } else {
              stepIndex++;
              tryNextStep();
            }
          })
          .catch(function (error) {
            stepIndex++;
            tryNextStep();
          });
      }

      // Start the process
      tryNextStep();
    };

    return button;
  }

  function processString(input) {
    const lines = input.split("\n");

    const processedLines = lines.map(line => {
      const cleanedLine = line.replace(/\t\|\t/g, "  ").replace(/\t\|\t\t\|\t/g, " ");
      const finalLine = cleanedLine.replace(/\t+/g, " ").trim();
      return finalLine;
    });

    const outputString = processedLines.join("\n\n");
    return outputString;
  }

  function makeResponseReadable(response) {
    const regex = /\{[^}]*\}/g;
    let match;
    let lastIndex = 0;
    let result = "";

    while ((match = regex.exec(response)) !== null) {
      result += response.slice(lastIndex, match.index);
      result += match[0] + "\n\n";
      lastIndex = regex.lastIndex;
    }
    result += response.slice(lastIndex);
    return result;
  }

  function formatNarrative(narr) {
    return narr.map(subPart => {
      if (subPart.startsWith('"') && subPart.endsWith('"')) {
        return subPart.substring(1, subPart.length - 1);
      }
      return subPart;
    });
  }

  function openXrayModal(searchResultsItem) {
    if (window.eysources.includes("--customers")) return;

    var modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay";

    var modal = document.createElement("div");
    modal.className = "modal";
    modal.style.position = "absolute";
    modal.style.left = "50%";
    modal.style.top = "50%";
    modal.style.transform = "translate(-50%, -50%)";

    var modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    var modalHeader = document.createElement("div");
    modalHeader.className = "modal-header";
    modalHeader.style.position = "sticky";
    modalHeader.style.top = "0";
    modalHeader.style.zIndex = "1";

    var modalTitle = document.createElement("h3");
    modalTitle.textContent = "Object Detail";

    var closeIcon = document.createElement("span");
    closeIcon.className = "close-icon";
    closeIcon.innerHTML = "&times;";

    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeIcon);

    var accordionContainer = document.createElement("div");
    accordionContainer.className = "accordion-container";

    var jsonAccordion = null;
    var narrativeAccordion = null;

    if (searchResultsItem.json) {
      jsonAccordion = createAccordion("JSON Formatted", searchResultsItem.json, true);
    }

    if (searchResultsItem.narrative) {
      var narrativeText = formatNarrative(searchResultsItem.narrative).join("\n\n");
      narrativeAccordion = createAccordion("Narrative", narrativeText);
    }

    var suggestedTextAccordion = createAccordion(
      "Suggested Text",
      makeResponseReadable(searchResultsItem.suggestedText),
    );
    var extractedTextAccordion = createAccordion(
      "Extracted Text",
      processString(searchResultsItem.text),
    );
    var fileKeywordsAccordion = createAccordion(
      "File Keywords",
      makeResponseReadable(searchResultsItem.fileKeywords),
    );

    if (jsonAccordion) {
      accordionContainer.appendChild(jsonAccordion);
    }

    if (narrativeAccordion) {
      accordionContainer.appendChild(narrativeAccordion);
    }

    accordionContainer.appendChild(suggestedTextAccordion);
    accordionContainer.appendChild(extractedTextAccordion);
    accordionContainer.appendChild(fileKeywordsAccordion);

    modalContent.appendChild(modalHeader);
    modalContent.appendChild(accordionContainer);

    modal.appendChild(modalContent);
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);

    closeIcon.addEventListener("click", function () {
      document.body.removeChild(modalOverlay);
    });

    closeIcon.addEventListener("pointerup", function () {
      document.body.removeChild(modalOverlay);
    });

    modalOverlay.addEventListener("click", function (e) {
      if (e.target === modalOverlay) {
        document.body.removeChild(modalOverlay);
      }
    });

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    // Mouse events
    modalHeader.addEventListener("mousedown", function (e) {
      isDragging = true;
      const rect = modal.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      e.preventDefault();
    });

    // Touch events
    modalHeader.addEventListener("touchstart", function (e) {
      isDragging = true;
      const rect = modal.getBoundingClientRect();
      const touch = e.touches[0];
      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;

      document.addEventListener("touchmove", onTouchMove);
      document.addEventListener("touchend", onTouchEnd);
      e.preventDefault();
    });

    function onMouseMove(e) {
      if (isDragging) {
        modal.style.left = e.clientX - offsetX + "px";
        modal.style.top = e.clientY - offsetY + "px";
        modal.style.transform = "";
      }
    }

    function onMouseUp() {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    function onTouchMove(e) {
      if (isDragging) {
        const touch = e.touches[0];
        modal.style.left = touch.clientX - offsetX + "px";
        modal.style.top = touch.clientY - offsetY + "px";
        modal.style.transform = "";
      }
    }

    function onTouchEnd() {
      isDragging = false;
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    }
  }

  function syntaxHighlight(json) {
    if (typeof json != "string") {
      json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\\s*:)?)|(\b(true|false|null)\b|-?\d+(\.\d*)?([eE][+\-]?\d+)?)/g,
      function (match) {
        let cls = "number";
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "key";
          } else {
            cls = "string";
          }
        } else if (/true|false/.test(match)) {
          cls = "boolean";
        } else if (/null/.test(match)) {
          cls = "null";
        }
        return '<span class="' + cls + '">' + match + "</span>";
      },
    );
  }
   
  function createAccordion(title, content, isJSON = false, isOpen = false) {
    var accordionItem = document.createElement("div");
    accordionItem.className = "accordion-item";

    var accordionHeader = document.createElement("div");
    accordionHeader.className = "accordion-header";

    var headerTitle = document.createElement("span");
    headerTitle.textContent = title;

    var arrowIcon = document.createElement("span");
    arrowIcon.className = "arrow-icon";
    arrowIcon.innerHTML = "&#9650;";

    accordionHeader.appendChild(headerTitle);
    accordionHeader.appendChild(arrowIcon);

    var accordionBody = document.createElement("div");
    accordionBody.className = "accordion-body";

    var accordionContent = document.createElement("div");
    accordionContent.className = "accordion-content";

    if (isJSON) {
      var pre = document.createElement("pre");
      pre.className = "json";
      pre.innerHTML = syntaxHighlight(content);

      pre.style.whiteSpace = "pre-wrap";
      pre.style.wordBreak = "break-word";
      pre.style.width = "100%";
      pre.style.overflowX = "hidden";

      accordionContent.appendChild(pre);
    } else {
      var contentText = content.replace(/<br \/>/g, "\n");
      contentText = contentText.replace(/^(\s*)\*(\s+)/gm, "$1\\*$2");
      accordionContent.innerHTML = mdConverter.makeHtml(contentText);
    }

    accordionBody.appendChild(accordionContent);
    accordionItem.appendChild(accordionHeader);
    accordionItem.appendChild(accordionBody);

    accordionBody.style.maxHeight = "0";

    accordionHeader.addEventListener("click", function () {
      var isActive = accordionItem.classList.toggle("active");
      if (isActive) {
        accordionBody.style.maxHeight = accordionBody.scrollHeight + "px";
        arrowIcon.style.transform = "rotate(180deg)";
      } else {
        accordionBody.style.maxHeight = "0";
        arrowIcon.style.transform = "rotate(0deg)";
      }
    });

    if (isOpen) {
      requestAnimationFrame(function () {
        accordionItem.classList.add("active");
        accordionBody.style.maxHeight = accordionBody.scrollHeight + "px";
        arrowIcon.style.transform = "rotate(180deg)";
      });
    }

    return accordionItem;
  }

  function hexToRgba(hex, alpha) {
    hex = hex.replace("#", "");

    if (hex.length === 3) {
      hex = hex
        .split("")
        .map(function (h) {
          return h + h;
        })
        .join("");
    }

    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
  }
  
  function createXrayContentHeader(url, fileName, pageNumber) {
    var xrayContentHeaderDiv = document.createElement("div");
    xrayContentHeaderDiv.id = "xray-content-header";
    xrayContentHeaderDiv.className = "xray-content-header";

    // Left Side
    var leftSide = document.createElement("div");
    leftSide.className = "left-content";

    var sourceLink = xraySourceLinkButton(url, pageNumber);
    leftSide.appendChild(sourceLink);

    // Middle (Document Name)
    var pageNumberLabel = "";
    if (pageNumber) {
      pageNumberLabel = " | " + "Page: " + pageNumber;
    }

    var middle = document.createElement("div");
    middle.className = "xray-document-name";
    middle.innerHTML = "File: " + fileName + pageNumberLabel;

    // Right Side (Close Icon)
    var rightSide = document.createElement("div");
    rightSide.className = "right-content";

    var closeIcon = document.createElement("button");
    closeIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
      <path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    closeIcon.className = "close-icon";
    closeIcon.id = "xray-close-icon";

    closeIcon.onclick = function () {
      const xrayContent = document.getElementById("xray-content");
      const xrayDiv = document.getElementById("xray");
      if (xrayContent) {
        xrayContent.remove();
      }
      if (xrayDiv) {
        const centerDiv = emptyXraySideBar();
        xrayDiv.appendChild(centerDiv);
      }
      removeActiveThumbnail();
      removeSourceHeaderContent();
    };

    rightSide.appendChild(closeIcon);

    // Assemble Header
    xrayContentHeaderDiv.appendChild(leftSide);
    xrayContentHeaderDiv.appendChild(middle);
    xrayContentHeaderDiv.appendChild(rightSide);

    return xrayContentHeaderDiv;
  }
  
  // MAIN RESIZE RIGHT SIDE BAR AND X-RAY
  window.addEventListener("resize", () => {
    if (!window.eysources.includes("xray-thumbnails")) return;

    var eyChatDiv = document.getElementById("eyChat");
    var resultWrapperDiv = document.getElementById("resultWrapper");
    var eyInputContainerDiv = document.getElementById("ey_input_container");
    var xrayDiv = document.getElementById("xray");

    if (eyChatDiv) {
      var eyChatWidth = eyChatDiv.offsetWidth;

      if (eyChatWidth < 900) {
        removeActiveThumbnail();
        removeSourceHeaderContent();
        eyChatDiv.style.width = "100%";

        if (resultWrapperDiv) {
          resultWrapperDiv.style.width = "100%";
        }

        if (eyInputContainerDiv) {
          eyInputContainerDiv.style.width = "100%";
        }

        if (xrayDiv) {
          xrayDiv.className = "xray_document_modal";

          if (xrayIsOpen) {
            xrayDiv.style.display = "flex";
            xrayDiv.style.flexDirection = "column";
            xrayDiv.style.position = "fixed";
            xrayDiv.style.top = "0";
            xrayDiv.style.left = "0";
            xrayDiv.style.width = "100%";
            xrayDiv.style.height = "100vh";
            xrayDiv.style.zIndex = "10";
            xrayDiv.style.backgroundColor = "#fff";

            var closeButton = document.getElementById("xray-close-icon");
            if (closeButton) {
              closeButton.onclick = function () {
                xrayDiv.remove();
                xrayIsOpen = false;
              };
            }
          } else {
            xrayDiv.remove();
          }
        }
      } else {
        // Adjust styles for large screens
        eyChatDiv.style.width = "100%";

        if (resultWrapperDiv) {
          resultWrapperDiv.style.width = "50%";
        }

        if (eyInputContainerDiv) {
          eyInputContainerDiv.style.width = "50%";
        }

        if (xrayDiv) {
          if (xrayDiv.classList.contains("xray_document_modal")) {
            xrayDiv.className = "xray_document";
            xrayDiv.style = "";
            xrayDiv.style.display = "flex";
            xrayDiv.style.flexDirection = "column";
            xrayDiv.style.height = "100vh";
            xrayDiv.style.overflow = "hidden";
            xrayDiv.style.marginBottom = "20px";

            var closeButton = document.getElementById("xray-close-icon");
            closeButton.onclick = function () {
              var xrayContent = document.getElementById("xray-content");
              xrayContent.remove();

              const centerDiv = emptyXraySideBar();
              xrayDiv.appendChild(centerDiv);
            };

            removeActiveThumbnail();
            removeSourceHeaderContent();

            if (!eyChatDiv.contains(xrayDiv)) {
              eyChatDiv.appendChild(xrayDiv);
            }

            xrayIsOpen = false;
          }
        } else {
          xrayDiv = document.createElement("div");
          xrayDiv.className = "xray_document";
          xrayDiv.id = "xray";

          var centerDiv = emptyXraySideBar();
          xrayDiv.appendChild(centerDiv);
          eyChatDiv.appendChild(xrayDiv);
        }
      }
    }
  });

  function emptyXraySideBar() {
    var centerDiv = document.createElement("div");
    centerDiv.id = "empty-source-sidebar";
    Object.assign(centerDiv.style, {
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    });

    var sourcesText = document.createElement("p");
    sourcesText.innerHTML = `
    After you've sent a chat message, a list of relevant pages will appear under the chat response.
    <br /><br />
    You can click those pages to explore how GroundX parsed and represented your documents via X-Ray.
    `;
    sourcesText.style.margin = 0;
    sourcesText.style.padding = "40px";
    sourcesText.style.textAlign = "left";
    sourcesText.style.color = "#2c3359";

    centerDiv.appendChild(sourcesText);

    return centerDiv;
  }

  function getPageNumberFromPageImagesUrl(pageImagesUrl) {
    if (pageImagesUrl) {
      var parts = pageImagesUrl.split("/");
      var lastPart = parts[parts.length - 1];
      var pageNumberStr = lastPart.split(".")[0];
      return parseInt(pageNumberStr);
    } else {
      return null;
    }
  }

  function loadNonXraysFiles(fileData) {
    var container = document.createElement("div");
    container.className = "non-xray-container";

    var suggestedTextAccordion = createAccordion(
      "Suggested Text",
      makeResponseReadable(fileData[0].suggestedText),
      false,
      true,
    );

    var extractedTextAccordion = createAccordion("Extracted Text", processString(fileData[0].text));

    var fileKeywordsAccordion = createAccordion(
      "File Keywords",
      makeResponseReadable(fileData[0].fileKeywords),
    );

    container.appendChild(suggestedTextAccordion);
    container.appendChild(extractedTextAccordion);
    container.appendChild(fileKeywordsAccordion);

    return container;
  }

  function openSourceLinkInThumbnailsSideBar(searchResultsItem) {
    var eyChatDiv = document.getElementById("eyChat");

    if (eyChatDiv) {
      var xrayDiv = document.getElementById("xray");

      if (!xrayDiv) {
        xrayDiv = document.createElement("div");
        xrayDiv.className = "xray_document";
        xrayDiv.id = "xray";

        eyChatDiv.appendChild(xrayDiv);
      } else {
        xrayDiv.innerHTML = "";
      }

      var xrayContentDiv = document.createElement("div");
      xrayContentDiv.className = "xray_document_content";
      xrayContentDiv.id = "xray-content";

      // Remove padding and margin to prevent overflow
      xrayContentDiv.style.padding = "20px";
      xrayContentDiv.style.margin = "0";

      // Set up flex layout to fill available space
      xrayContentDiv.style.display = "flex";
      xrayContentDiv.style.flexDirection = "column";
      xrayContentDiv.style.flex = "1";
      xrayContentDiv.style.overflow = "hidden";

      // Ensure parent xrayDiv fills the available space
      xrayDiv.style.display = "flex";
      xrayDiv.style.flexDirection = "column";
      xrayDiv.style.height = "100vh"; // Set height to viewport height
      xrayDiv.style.overflow = "hidden";
      xrayDiv.style.marginBottom = "20px";

      var firstItem = searchResultsItem.items[0];
      var pageNumber = getPageNumberFromPageImagesUrl(searchResultsItem.pageImagesUrl);
      var xrayContentHeaderDiv = createXrayContentHeader(
        firstItem.url,
        firstItem.fileName,
        pageNumber,
      );

      xrayContentDiv.appendChild(xrayContentHeaderDiv);

      var allBoundingBoxes = [];
      var colors = ["#63EF0F", "#613AD1", "#EAEE30", "#FF8A40"];

      searchResultsItem.items.forEach(function (item, index) {
        var color = colors[index % colors.length];
        if (item.boundingBoxes) {
          item.boundingBoxes.forEach(function (box) {
            box.color = color;
            box.itemIndex = index;
            allBoundingBoxes.push(box);
          });
        }
      });

      var imgData = {
        pageImagesUrl: searchResultsItem.pageImagesUrl,
        boundingBoxes: allBoundingBoxes,
        items: searchResultsItem.items,
      };

      var imgContainer;

      if (imgData.pageImagesUrl) {
        imgContainer = createXrayImageWithBoxes(imgData);
      } else {
        imgContainer = loadNonXraysFiles(imgData.items);
      }

      xrayContentDiv.appendChild(imgContainer);
      xrayDiv.appendChild(xrayContentDiv);

      var resultWrapperDiv = document.getElementById("resultWrapper");
      var eyInputContainerDiv = document.getElementById("ey_input_container");

      var eyChatWidth = eyChatDiv.offsetWidth;

      if (eyChatWidth < 900) {
        if (resultWrapperDiv) {
          resultWrapperDiv.style.width = "100%";
        }

        if (eyInputContainerDiv) {
          eyInputContainerDiv.style.width = "100%";
        }

        xrayDiv.className = "xray_document_modal";
        xrayDiv.style.display = "flex";
        xrayDiv.style.flexDirection = "column";
        xrayDiv.style.position = "fixed";
        xrayDiv.style.top = "0";
        xrayDiv.style.left = "0";
        xrayDiv.style.width = "100%";
        xrayDiv.style.height = "100vh";
        xrayDiv.style.zIndex = "10";
        xrayDiv.style.backgroundColor = "#fff";

        var closeButton = document.getElementById("xray-close-icon");
        if (closeButton) {
          closeButton.onclick = function () {
            xrayDiv.remove();
            xrayIsOpen = false;
            removeActiveThumbnail();
            removeSourceHeaderContent();
          };
        }

        xrayIsOpen = true;
      } else {
        // Large screen adjustments
        if (resultWrapperDiv) {
          resultWrapperDiv.style.width = "50%";
        }

        if (eyInputContainerDiv) {
          eyInputContainerDiv.style.width = "50%";
        }

        xrayDiv.className = "xray_document";
        xrayIsOpen = false;
      }
    }
  }

  function createXrayImageWithBoxes(imgData) {
    var isNonXrayDocument = !imgData.pageImagesUrl;
    var documentData = imgData.items[0];

    var container = document.createElement("div");
    container.className = "xray-container";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.flex = "1";
    container.style.overflow = "hidden";
    container.style.paddingBottom = "40px";

    var zoomControlsDiv = document.createElement("div");
    zoomControlsDiv.style.display = "flex";
    zoomControlsDiv.style.flexDirection = "row";
    zoomControlsDiv.style.alignItems = "center";
    zoomControlsDiv.style.alignContent = "center";
    zoomControlsDiv.style.width = "100%";

    if (window.eysources.includes("--devs")) {
      zoomControlsDiv.style.marginBottom = "6px";

      var fullXrayLink = xrayLinkButton(documentData.documentId, isNonXrayDocument);
      zoomControlsDiv.appendChild(fullXrayLink);
    }

    var zoomControls = document.createElement("div");
    zoomControls.className = "zoom-controls";
    zoomControls.style.display = "flex";
    zoomControls.style.justifyContent = "flex-start";
    zoomControls.style.marginBottom = "5px";
    zoomControls.style.marginTop = "5px";
    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(resetZoomBtn);
    zoomControls.appendChild(zoomInBtn);

    zoomControlsDiv.appendChild(zoomControls);

    // Image container
    var imageContainer = document.createElement("div");
    imageContainer.className = "image-container";
    imageContainer.style.position = "relative";
    imageContainer.style.overflow = "hidden";

    var loadingText = document.createElement("div");
    loadingText.className = "loading-text";
    loadingText.textContent = "Loading...";
    imageContainer.appendChild(loadingText);

    var imgWrapper = document.createElement("div");
    imgWrapper.className = "img-wrapper";
    imgWrapper.style.position = "relative";
    imgWrapper.style.cursor = "grab";
    imgWrapper.style.width = "100%";
    imgWrapper.style.height = "auto";
    imgWrapper.style.touchAction = "none";

    var img = document.createElement("img");
    img.src = imgData.pageImagesUrl;
    img.crossOrigin = "Anonymous";
    img.style.display = "block";
    img.style.userSelect = "none";
    img.style.width = "100%";
    img.style.height = "auto";
    img.style.objectFit = "contain";

    imgWrapper.appendChild(img);
    imageContainer.appendChild(imgWrapper);

    container.appendChild(zoomControlsDiv);
    container.appendChild(imageContainer);

    // Variables for zoom and drag
    var scale = 1;
    var isDragging = false;
    var startX,
      startY,
      currentX = 0,
      currentY = 0;
    var dragStartX, dragStartY;
    var hasDragged = false;
    var aspectRatio;

    function updateScale() {
      imgWrapper.style.transform = "scale(" + scale + ")";
      imgWrapper.style.transformOrigin = "center center";
      updateZoomButtons();
    }

    function resetPosition() {
      currentX = 0;
      currentY = 0;
      imgWrapper.style.left = currentX + "px";
      imgWrapper.style.top = currentY + "px";
    }

    function updateCursor() {
      imgWrapper.style.cursor = scale > 1 ? "grab" : "default";
    }

    function updateZoomButtons() {
      zoomOutBtn.disabled = scale <= 1;
      resetZoomBtn.disabled = scale <= 1;
    }

    zoomInBtn.addEventListener("click", function () {
      scale += 0.1;
      updateScale();
      updateCursor();
    });

    zoomOutBtn.addEventListener("click", function () {
      scale = Math.max(0.5, scale - 0.1);
      updateScale();
      resetPosition();
      updateCursor();
    });

    resetZoomBtn.addEventListener("click", function () {
      scale = 1;
      updateScale();
      resetPosition();
      updateCursor();
    });

    updateZoomButtons();

    imgWrapper.addEventListener("mousedown", function (e) {
      if (scale <= 1) return;
      isDragging = true;
      hasDragged = false;
      startX = e.clientX - currentX;
      startY = e.clientY - currentY;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      imgWrapper.style.cursor = "grabbing";
      e.preventDefault();
    });

    document.addEventListener("mousemove", function (e) {
      if (!isDragging) return;
      var dx = e.clientX - dragStartX;
      var dy = e.clientY - dragStartY;
      // Set a threshold to detect significant movement
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasDragged = true;
      }
      currentX = e.clientX - startX;
      currentY = e.clientY - startY;
      imgWrapper.style.left = currentX + "px";
      imgWrapper.style.top = currentY + "px";
    });

    document.addEventListener("mouseup", function () {
      if (!isDragging) return;
      isDragging = false;
      imgWrapper.style.cursor = "grab";
    });

    imgWrapper.addEventListener("touchstart", function (e) {
      if (scale <= 1) return;
      if (e.touches.length !== 1) return;
      e.preventDefault();
      var touch = e.touches[0];
      isDragging = true;
      hasDragged = false;
      startX = touch.clientX - currentX;
      startY = touch.clientY - currentY;
      dragStartX = touch.clientX;
      dragStartY = touch.clientY;
      imgWrapper.style.cursor = "grabbing";
    });

    imgWrapper.addEventListener("touchmove", function (e) {
      if (!isDragging) return;
      if (e.touches.length !== 1) return;
      e.preventDefault();
      var touch = e.touches[0];
      var dx = touch.clientX - dragStartX;
      var dy = touch.clientY - dragStartY;
      // Set a threshold to detect significant movement
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasDragged = true;
      }
      currentX = touch.clientX - startX;
      currentY = touch.clientY - startY;
      imgWrapper.style.left = currentX + "px";
      imgWrapper.style.top = currentY + "px";
    });

    imgWrapper.addEventListener("touchend", function () {
      if (!isDragging) return;
      isDragging = false;
      imgWrapper.style.cursor = "grab";
    });

    img.onload = function () {
      imageContainer.removeChild(loadingText);
      imageContainer.style.border = "1px solid #ccc";

      var imgWidth = img.naturalWidth;
      var imgHeight = img.naturalHeight;
      var padding = 5;

      aspectRatio = imgWidth / imgHeight;

      handleResize();

      if (imgWidth < imgHeight) {
        imageContainer.style.maxWidth = "500px";
        imageContainer.style.margin = "0 auto";
      }

      imgData.boundingBoxes.forEach(function (box) {
        var topLeftX = Math.max(0, box.topLeftX - padding);
        var topLeftY = Math.max(0, box.topLeftY - padding);
        var bottomRightX = Math.min(imgWidth, box.bottomRightX + padding);
        var bottomRightY = Math.min(imgHeight, box.bottomRightY + padding);

        var xPercent = (topLeftX / imgWidth) * 100;
        var yPercent = (topLeftY / imgHeight) * 100;
        var widthPercent = ((bottomRightX - topLeftX) / imgWidth) * 100;
        var heightPercent = ((bottomRightY - topLeftY) / imgHeight) * 100;

        var div = document.createElement("div");
        div.className = "bounding-box";
        div.style.position = "absolute";
        div.style.left = xPercent + "%";
        div.style.top = yPercent + "%";
        div.style.width = widthPercent + "%";
        div.style.height = heightPercent + "%";
        div.style.backgroundColor = hexToRgba(box.color, 0.3);
        div.style.border = box.color;

        var item = imgData.items[box.itemIndex];

        div.addEventListener("click", function (e) {
          if (!hasDragged) {
            openXrayModal(item);
          }
        });

        div.addEventListener("touchend", function (e) {
          if (!hasDragged) {
            openXrayModal(item);
          }
          e.preventDefault();
        });

        imgWrapper.appendChild(div);
      });
    };

    function handleResize() {
      if (typeof aspectRatio !== "undefined") {
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;

        var verticalPadding = 150;
        var divisionFactor = windowWidth < 900 ? 1 : 2;
        var horizontalPadding = windowWidth < 900 ? 50 : 100;
        var availableHeight = windowHeight - verticalPadding;
        var newWidth = availableHeight * aspectRatio;
        var maxWidth = (windowWidth - horizontalPadding) / divisionFactor;
        newWidth = Math.min(newWidth, maxWidth);

        imageContainer.style.width = newWidth + "px";
      }
    }

    window.addEventListener("resize", handleResize);

    return container;
  }
 
  function initEmptyXraySourceBar() {
    var eyChatDiv = document.getElementById("eyChat");
    var resultWrapperDiv = document.getElementById("resultWrapper");
    var result = document.getElementById("result");
    var eyInputContainerDiv = document.getElementById("ey_input_container");

    if (eyChatDiv) {
      var eyChatWidth = eyChatDiv.offsetWidth;

      if (eyChatWidth < 900) {
        eyChatDiv.style.width = "100%";

        if (resultWrapperDiv) {
          resultWrapperDiv.style.width = "100%";
        }

        if (eyInputContainerDiv) {
          eyInputContainerDiv.style.width = "100%";
        }

        if (result) {
          result.style.border = "none";
        }
      } else {
        var xrayDiv = document.getElementById("xray");

        if (!xrayDiv) {
          xrayDiv = document.createElement("div");
          xrayDiv.className = "xray_document";
          xrayDiv.id = "xray";

          var centerDiv = emptyXraySideBar();
          xrayDiv.appendChild(centerDiv);
          eyChatDiv.appendChild(xrayDiv);
        } else {
          xrayDiv.innerHTML = "";
        }

        if (result) {
          result.style.border = "none";
        }

        if (resultWrapperDiv) {
          resultWrapperDiv.style.width = "50%";
        }

        if (eyInputContainerDiv) {
          eyInputContainerDiv.style.width = "50%";
        }
      }

      removeFileUploader();
    }
  }
 
  function removeFileUploader() {
    var fileUploadContainer = document.getElementById("fileUploadContainer");
    if (fileUploadContainer) {
      fileUploadContainer.remove();
    }
  }
 
  function removeSourceHeaderContent() {
    if (previousMessageContainerId) {
      const previousDiv = document.querySelector(
        `div.server-response[id^="static-${previousMessageContainerId}"]`,
      );
      if (previousDiv) {
        const sourceHeader = previousDiv.querySelector("h4.source-header");
        if (sourceHeader) {
          sourceHeader.innerHTML = "Sources";
        }
      }
    }
  }
  
  function toggleThumbnailsActive(component, selectedSource, messageContainerId) {
    if (!window.eysources.includes("xray-thumbnails")) return;

    if (previousMessageContainerId !== messageContainerId) {
      removeSourceHeaderContent();
    }

    const serverResponseDiv = document.querySelector(
      `div.server-response[id^="static-${messageContainerId}"]`,
    );

    var file = selectedSource.items[0];

    if (serverResponseDiv) {
      const sourceHeader = serverResponseDiv.querySelector("h4.source-header");
      if (sourceHeader) {
        var fileName;
        if (file.fileName.length > 45) {
          fileName = file.fileName.substring(0, 45) + "...";
        } else {
          fileName = file.fileName;
        }
        var s = document.createElement("span");
        s.style.color = "#fff";
        s.style.backgroundColor = "#2c3359";
        s.style.padding = "2px 8px";
        s.style.borderRadius = "5px";
        s.style.fontWeight = "400";
        s.innerText = fileName;

        sourceHeader.innerHTML = "Sources: ";
        sourceHeader.appendChild(s);
        previousMessageContainerId = messageContainerId;
      }
    }

    var thumbnails = document.querySelectorAll(
      ".thumbnail-item.active, .thumbnail-non-pdf-item.active",
    );
    thumbnails.forEach(thumb => {
      thumb.classList.remove("active");
    });

    var thumbnailItem = component.querySelector(".thumbnail-item, .thumbnail-non-pdf-item");
    if (thumbnailItem) {
      thumbnailItem.classList.add("active");
    }
  }

  function handleClickSourceUrl(searchResultsItem, text, index, messageContainerId) {
    if (window.eysources === "modal") {
      return openSourceLinkInModal(searchResultsItem.url, text, index);
    }

    if (window.eysources === "sidebar") {
      return openSourceLinkInSideBar(searchResultsItem.url, text, index, messageContainerId);
    }

    window.open(url, "_blank");
  }

  function removeDuplicateUrls(arr) {
    var seenUrls = {};
    return arr.filter(function (item) {
      if (seenUrls[item.url]) {
        return false;
      } else {
        seenUrls[item.url] = true;
        return true;
      }
    });
  }

  function prepareDataForBoxDrawing(res) {
    var groupedArray = [];
    var groupMap = {};

    res.forEach(function (item) {
      var key = item.pageImagesUrl;

      if (!groupMap[key]) {
        groupMap[key] = {
          pageImagesUrl: key,
          items: [],
        };
        groupedArray.push(groupMap[key]);
      }

      groupMap[key].items.push(item);
    });

    return groupedArray;
  }

  function getFileType(fileName) {
    if (!fileName || typeof fileName !== "string") {
      throw new Error("Invalid file name");
    }

    const parts = fileName.split(".");
    if (parts.length < 2) {
      throw new Error("File name does not contain a valid extension");
    }

    return parts.pop().toLowerCase();
  }

  function createClickableSourceURLs(searchRes, messageContainerId) {
    var searchResults;
    if (window.eysources.includes("xray-thumbnails")) {
      searchResults = prepareDataForBoxDrawing(searchRes);
    } else {
      searchResults = removeDuplicateUrls(searchRes);
    }

    var container = createDivElement({ id: "source-links", className: "source-links" });
    var header = createHeaderElement({
      id: "sourceHeader",
      h: "h4",
      innerText: "Sources",
      className: "source-header",
    });
    container.appendChild(header);

    var sourceLinksContainer = createDivElement({
      id: "source-links-container",
      className: "source-links-container",
    });

    if (window.eysources.includes("xray-thumbnails")) {
      searchResults.forEach(function (item) {
        var component = thumbnailsItemComponent(item.pageImagesUrl, item.items[0].fileName);

        component.onclick = function () {
          openSourceLinkInThumbnailsSideBar(item);
          toggleThumbnailsActive(component, item, messageContainerId);
        };

        sourceLinksContainer.appendChild(component);
      });
    } else {
      searchResults.forEach(function (item, index) {
        var component = linkItemComponent(index + 1, item, item.fileName);
        component.onclick = function () {
          handleClickSourceUrl(item, item.text, index + 1, messageContainerId);
        };
        sourceLinksContainer.appendChild(component);
      });
    }

    container.appendChild(sourceLinksContainer);
    return container;
  }

function randomString(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function extractUrl(queryString) {
  var urlRegex = /[?&]url=([^&#]*)/;
  var match = urlRegex.exec(queryString);
  if (match && match[1]) {
      return decodeURIComponent(match[1]);
  }
  return null;
}

function isiOS() {
  if (!navigator || !navigator.platform) {
    return false;
  }

  if (
    [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
  ) {
    return true;
  }

  if (!navigator.userAgent || !document) {
    return false;
  }

  if (navigator.userAgent.includes("Mac") && "ontouchend" in document) {
    return true;
  }

  return false;
}

function supportsPassive() {
  var cold = false,
  hike = function() {};

  try {
    var aid = Object.defineProperty({}, 'passive', {
      get: function() {
        cold = true;
      }
    });
    window.addEventListener('test', hike, aid);
    window.removeEventListener('test', hike, aid);
  } catch (e) {}
  return cold;
}
window.supportsPassive = supportsPassive;

function doFeedback() {
  return ((window.eySocket
    && window.eySocket.lastInteraction
    && window.eySocket.lastInteraction.metadata
    && window.eySocket.lastInteraction.metadata.feedbackType) ||
    (window.eyfeedback))
    && !window.eySocket.isStreaming;
}

function feedbackType() {
  if (window.eySocket
    && window.eySocket.lastInteraction
    && window.eySocket.lastInteraction.metadata
    && window.eySocket.lastInteraction.metadata.feedbackType) {
      return window.eySocket.lastInteraction.metadata.feedbackType;
  }

  return window.eyfeedback;
}

function reportFeedback(data, callback) {
  var xhr = new XMLHttpRequest();

  var apiu = "https://api.eyelevel.ai/track";
  switch(window.eyEnv) {
    case 'dev':
    case 'local':
    case 'local-chat-dev':
    case 'local-css-dev':
    case 'local-dev':
      apiu = "https://devapi.eyelevel.ai/track";
      break;
  }

  xhr.open("POST", apiu, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
          if (xhr.status !== 200) {
              console.error("Error:", xhr.statusText);
              if (callback) {
                callback(false);
              }
          } else if (callback) {
            callback(true);
          }
      }
  };

  xhr.onerror = function () {
      console.error("Request failed");
      if (callback) {
        callback(false);
      }
  };

  xhr.send(JSON.stringify(data));
}


if (!window.localStorage) {
  Object.defineProperty(window, "localStorage", new (function () {
    var aKeys = [], oStorage = {};
    Object.defineProperty(oStorage, "getItem", {
      value: function (sKey) { return sKey ? this[sKey] : null; },
      writable: false,
      configurable: false,
      enumerable: false
    });
    Object.defineProperty(oStorage, "key", {
      value: function (nKeyId) { return aKeys[nKeyId]; },
      writable: false,
      configurable: false,
      enumerable: false
    });
    Object.defineProperty(oStorage, "setItem", {
      value: function (sKey, sValue) {
        if(!sKey) { return; }
        document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
      },
      writable: false,
      configurable: false,
      enumerable: false
    });
    Object.defineProperty(oStorage, "length", {
      get: function () { return aKeys.length; },
      configurable: false,
      enumerable: false
    });
    Object.defineProperty(oStorage, "removeItem", {
      value: function (sKey) {
        if(!sKey) { return; }
        document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      },
      writable: false,
      configurable: false,
      enumerable: false
    });
    this.get = function () {
      var iThisIndx;
      for (var sKey in oStorage) {
        iThisIndx = aKeys.indexOf(sKey);
        if (iThisIndx === -1) { oStorage.setItem(sKey, oStorage[sKey]); }
        else { aKeys.splice(iThisIndx, 1); }
        delete oStorage[sKey];
      }
      for (aKeys; aKeys.length > 0; aKeys.splice(0, 1)) { oStorage.removeItem(aKeys[0]); }
      for (var aCouple, iKey, nIdx = 0, aCouples = document.cookie.split(/\s*;\s*/); nIdx < aCouples.length; nIdx++) {
        aCouple = aCouples[nIdx].split(/\s*=\s*/);
        if (aCouple.length > 1) {
          oStorage[iKey = unescape(aCouple[0])] = unescape(aCouple[1]);
          aKeys.push(iKey);
        }
      }
      return oStorage;
    };
    this.configurable = false;
    this.enumerable = true;
  })());
}

getUser = function() {
  var userId = window.localStorage.getItem('eyelevel.user.userId');
  var aid = window.localStorage.getItem('eyelevel.user.aid');
  var isTransfer = window.localStorage.getItem('eyelevel.user.transfer') ? true : false;

  var newUser = false;
  if (!userId) {
    newUser = true;
    userId = randomString(32);
    window.localStorage.setItem('eyelevel.user.userId', userId);
  }

  return { userId: userId, aid: aid, GUID: aid + ":" + userId, isTransfer: isTransfer, newUser: newUser };
}

updateUser = function(req) {
  if (!req || hasInit) {
    return;
  }

  if (req.action && req.action === 'heartbeat') {
    return;
  }

  if (!req.session || !req.session.GUID || !req.session.GUID.refUserId || !parseInt(req.session.GUID.aid)) {
    return;
  }

  hasInit = true;
  var user = getUser();
  if (!user || !user.userId || !user.aid || user.userId != req.session.GUID.refUserId || user.aid != parseInt(req.session.GUID.aid)) {
    window.localStorage.setItem('eyelevel.user.userId', req.session.GUID.refUserId);
    window.localStorage.setItem('eyelevel.user.aid', parseInt(req.session.GUID.aid));
    window.user.userId = req.session.GUID.refUserId;
    window.user.aid = parseInt(req.session.GUID.aid);
    window.parent.postMessage('user:'+JSON.stringify(window.user), "*");
  }
}

turnUUID = function(sess) {
  if (sess) {
    if (sess.TraceNext && sess.TraceNext.turnUUID && sess.TraceNext.turnUUID !== '00000000-0000-0000-0000-000000000000') {
      return sess.TraceNext.turnUUID;
    } else if (sess.Trace && sess.Trace.turnUUID && sess.Trace.turnUUID !== '00000000-0000-0000-0000-000000000000') {
      return sess.Trace.turnUUID;
    }
  }
  return null;
}

turnUUIDInvert = function(sess) {
  if (sess) {
    if (sess.Trace && sess.Trace.turnUUID && sess.Trace.turnUUID !== '00000000-0000-0000-0000-000000000000') {
      return sess.Trace.turnUUID;
    } else if (sess.TraceNext && sess.TraceNext.turnUUID && sess.TraceNext.turnUUID !== '00000000-0000-0000-0000-000000000000') {
      return sess.TraceNext.turnUUID;
    }
  }
  return null;
}

saveInteraction = function(interaction) {
  interaction.time = Date.now();
  if (interaction && interaction.sender && interaction.sender === 'user') {
    interaction.host = window.location.host;
    interaction.pathname = window.location.pathname;
    interaction.uid = getUser().userId;
    interaction.username = window.username;
    interaction.origin = window.origin || 'web';
    if (typeof window.flowname !== 'undefined') {
      interaction.flowname = window.flowname;
    }
    window.parent.postMessage('track:'+JSON.stringify(interaction), "*");
  } else {
    interaction.seen = window.isOpen;
    if (interaction && interaction.payload) {
      var pay = JSON.parse(interaction.payload);
      if (pay && pay.set_attributes) {
        return;
      }
    }
  }
  interaction = updateAIMessages(interaction);

  var h = window.localStorage.getItem('eyelevel.conversation.history');
  if (h && typeof h !== 'undefined') {
    var history = JSON.parse(h);
    if (history) {
      var interUUID = turnUUIDInvert(interaction.session);
      var isSet = false;
      if (interUUID) {
        for (var i = 0; i < history.length; i++) {
          var tid = turnUUIDInvert(history[i].session);
          if (tid && tid === interUUID && !history[i].isDone) {
            history[i] = interaction;
            isSet = true;
            break;
          }
        }
      }
      if (!isSet) {
        history.push(interaction)
      }
    } else {
      history = [interaction];
    }
    window.localStorage.setItem('eyelevel.conversation.history', JSON.stringify(history));
  } else {
    var history = [interaction];
    window.localStorage.setItem('eyelevel.conversation.history', JSON.stringify(history));
  }
}

clearAll = function(isTransfer) {
  if (isTransfer) {
    window.localStorage.removeItem('eyelevel.user.transfer');
  } else {
    window.localStorage.removeItem('eyelevel.user.transfer');
    window.localStorage.removeItem('eyelevel.conversation.history');
    window.localStorage.removeItem('eyelevel.conversation.session');
    window.localStorage.removeItem('eyelevel.conversation.consent');
    window.localStorage.removeItem('eyelevel.conversation.alerts');
    window.localStorage.removeItem('eyelevel.conversation.open');
  }
}

saveConsent = function(consent) {
  window.localStorage.setItem('eyelevel.conversation.consent', consent);
}

getConsent = function() {
  return window.localStorage.getItem('eyelevel.conversation.consent');
}

window.isOpen = false;

saveSession = function(sess) {
  if (sess && sess.Pos.flowUUID && sess.Pos.turnID && sess.Pos.flowUUID !== "00000000-0000-0000-0000-000000000000" && parseInt(sess.Pos.turnID) !== 0) {
    window.localStorage.setItem('eyelevel.conversation.session', JSON.stringify(sess));
    if (sess.GUID && sess.GUID.refUserId && sess.GUID.aid && parseInt(sess.GUID.aid) > 0) {
      window.localStorage.setItem('eyelevel.user.aid', parseInt(sess.GUID.aid));
      window.localStorage.setItem('eyelevel.user.userId', sess.GUID.refUserId);
      window.user.userId = sess.GUID.refUserId;
      window.user.aid = parseInt(sess.GUID.aid);
    }
  }
}

setTransfer = function(val) {
  if (val) {
    window.localStorage.setItem('eyelevel.user.transfer', 'true');
    window.user = getUser();
    if (window.eymenu) {
      var mn = document.getElementById('ey-menu-tr');
      if (mn) {
        var n = new RegExp("(?:^|\\s)active(?!\\S)", "gi");
        mn.className = mn.className.replace(n, "");
      }
      mn = document.getElementById('ey-menu-br');
      if (mn) {
        var n = new RegExp("(?:^|\\s)active(?!\\S)", "gi");
        mn.className = mn.className.replace(n, "");
      }
    }
  } else {
    window.localStorage.removeItem('eyelevel.user.transfer');
    window.user = getUser();
  }
}

getSession = function() {
  var s = window.localStorage.getItem('eyelevel.conversation.session');
  if (s && typeof s !== 'undefined') {
    var sess = JSON.parse(s);
    if (sess) {
      if (sess.position) {
        sess.Pos = sess.position;
      }
    }
    return sess;
  }
}

function updateAIMessages(intr) {
  if (intr
    && intr.sender
    && intr.sender === 'server'
    && intr.session
    && intr.session.Trace
    && intr.session.Trace.turnUUID) {
    var turnUUID = intr.session.Trace.turnUUID;
    if (aiMessages[turnUUID] && typeof aiMessages[turnUUID] === 'object') {
      var isSet = false;
      for (var i = 0; i < aiMessages[turnUUID].length; i++) {
        var msg = aiMessages[turnUUID][i];
        if (!msg.isDone && msg.payload && intr.payload) {
          var mdata = JSON.parse(msg.payload);
          var idata = JSON.parse(intr.payload);
          if (mdata.text) {
            if (idata.text) {
              mdata.text += idata.text;
            } else if (idata.attachment && idata.attachment.payload && idata.attachment.payload.text) {
              idata.attachment.payload.text = mdata.text + idata.attachment.payload.text;
              mdata = idata;
            }
          } else if (mdata.attachment && mdata.attachment.payload && mdata.attachment.payload.text) {
            if (idata.text) {
              mdata.attachment.payload.text += idata.text;
            } else if (idata.attachment && idata.attachment.payload && idata.attachment.payload.text) {
              idata.attachment.payload.text = mdata.attachment.payload.text + idata.attachment.payload.text;
              mdata = idata;
            }
          }
          msg.isDone = intr.isDone;
          msg.typing = intr.typing;
          msg.payload = JSON.stringify(mdata);
          msg.metadata = intr.metadata;
          aiMessages[turnUUID][i] = msg;
          intr = msg;
          isSet = true;
          break;
        }
      }
      if (!isSet) {
        aiMessages[turnUUID].push(intr);
      }
    } else {
      aiMessages[turnUUID] = [intr];
    }
  }

  return intr;
}

retrieveInteractions = function(doAI) {
  var h = window.localStorage.getItem('eyelevel.conversation.history');
  if (h && typeof h !== 'undefined' && h !== 'undefined') {
    var history = JSON.parse(h);
    if (doAI) {
      for (var t = 0; t < history.length; t++) {
        history[t].isCached = true;
        history[t].isDone = true;
        updateAIMessages(history[t]);
      }
    }
    return history;
  }
}

setSeen = function() {
  var ints = retrieveInteractions(false);
  if (ints) {
    for (var t = 0; t < ints.length; t++) {
      if (ints[t] && ints[t].sender && ints[t].sender === 'user') {
      } else if (!ints[t].seen) {
        ints[t].seen = window.isOpen;
      }
    }

    window.localStorage.setItem('eyelevel.conversation.history', JSON.stringify(ints));
    window.parent.postMessage("alert-update", "*");
  }
}

var distX, distY, elapsedTime, startTime, startX, startY, swipeDir;
var timeThresh = 300;
var primaryThresh = 50;
var secondaryThresh = 50;
swipeStart = function(e) {
  var touchobj = e.changedTouches[0];
  swipeDir = 'none';
  distX = 0;
  distY = 0;
  startX = touchobj.pageX;
  startY = touchobj.pageY;
  startTime = new Date().getTime();
};

swipeEnd = function(e) {
  var touchobj = e.changedTouches[0];
  distX = touchobj.pageX - startX;
  distY = touchobj.pageY - startY;
  elapsedTime = new Date().getTime() - startTime;
  if (elapsedTime <= timeThresh) {
    if (Math.abs(distX) >= primaryThresh && Math.abs(distY) <= secondaryThresh){
      swipeDir = (distX < 0) ? 'left' : 'right';
    } else if (Math.abs(distY) >= primaryThresh && Math.abs(distX) <= secondaryThresh) {
      swipeDir = (distY < 0) ? 'up' : 'down';
    }
  }

  return swipeDir;
};

window.user = getUser();
window.isChatting = false;
window.menu = null;

!function(e) {
    function n(r) {
        if (t[r]) return t[r].exports;
        var o = t[r] = {
            i: r,
            l: !1,
            exports: {}
        };
        return e[r].call(o.exports, o, o.exports, n), o.l = !0, o.exports
    }
    var t = {};
    n.m = e, n.c = t, n.i = function(e) {
        return e
    }, n.d = function(e, t, r) {
        n.o(e, t) || Object.defineProperty(e, t, {
            configurable: !1,
            enumerable: !0,
            get: r
        })
    }, n.n = function(e) {
        var t = e && e.__esModule ? function() {
            return e.default
        } : function() {
            return e
        };
        return n.d(t, "a", t), t
    }, n.o = function(e, n) {
        return Object.prototype.hasOwnProperty.call(e, n)
    }, n.p = "/api-client/js/bundles", n(n.s = 79)
}([function(e, n, t) {
    var r = t(30)("wks"),
        o = t(33),
        i = t(1).Symbol,
        a = "function" == typeof i;
    (e.exports = function(e) {
        return r[e] || (r[e] = a && i[e] || (a ? i : o)("Symbol." + e))
    }).store = r
}, function(e, n) {
    var t = e.exports = "undefined" != typeof window && window.Math == Math ? window : "undefined" != typeof self && self.Math == Math ? self : Function("return this")();
    "number" == typeof __g && (__g = t)
}, function(e, n) {
    var t = e.exports = {
        version: "2.4.0"
    };
    "number" == typeof __e && (__e = t)
}, function(e, n, t) {
    var r = t(11);
    e.exports = function(e) {
        if (!r(e)) throw TypeError(e + " is not an object!");
        return e
    }
}, function(e, n, t) {
    e.exports = !t(25)(function() {
        return 7 != Object.defineProperty({}, "a", {
            get: function() {
                return 7
            }
        }).a
    })
}, function(e, n, t) {
    var r = t(7),
        o = t(29);
    e.exports = t(4) ? function(e, n, t) {
        return r.f(e, n, o(1, t))
    } : function(e, n, t) {
        return e[n] = t, e
    }
}, function(e, n) {
    e.exports = {}
}, function(e, n, t) {
    var r = t(3),
        o = t(47),
        i = t(68),
        a = Object.defineProperty;
    n.f = t(4) ? Object.defineProperty : function(e, n, t) {
        if (r(e), n = i(n, !0), r(t), o) try {
            return a(e, n, t)
        } catch (e) {}
        if ("get" in t || "set" in t) throw TypeError("Accessors not supported!");
        return "value" in t && (e[n] = t.value), e
    }
}, function(e, n) {
    var t = {}.toString;
    e.exports = function(e) {
        return t.call(e).slice(8, -1)
    }
}, function(e, n, t) {
    var r = t(14);
    e.exports = function(e, n, t) {
        if (r(e), void 0 === n) return e;
        switch (t) {
            case 1:
                return function(t) {
                    return e.call(n, t)
                };
            case 2:
                return function(t, r) {
                    return e.call(n, t, r)
                };
            case 3:
                return function(t, r, o) {
                    return e.call(n, t, r, o)
                }
        }
        return function() {
            return e.apply(n, arguments)
        }
    }
}, function(e, n) {
    var t = {}.hasOwnProperty;
    e.exports = function(e, n) {
        return t.call(e, n)
    }
}, function(e, n) {
    e.exports = function(e) {
        return "object" == typeof e ? null !== e : "function" == typeof e
    }
}, function(e, n, t) {
    "use strict";
    n.__esModule = !0, n.default = function(e, n) {
        if (!(e instanceof n)) throw new TypeError("Cannot call a class as a function")
    }
}, function(e, n, t) {
    "use strict";
    n.__esModule = !0;
    var r = t(38),
        o = function(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }(r);
    n.default = function() {
        function e(e, n) {
            for (var t = 0; t < n.length; t++) {
                var r = n[t];
                r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), (0, o.default)(e, r.key, r)
            }
        }
        return function(n, t, r) {
            return t && e(n.prototype, t), r && e(n, r), n
        }
    }()
}, function(e, n) {
    e.exports = function(e) {
        if ("function" != typeof e) throw TypeError(e + " is not a function!");
        return e
    }
}, function(e, n) {
    e.exports = function(e) {
        if (void 0 == e) throw TypeError("Can't call method on  " + e);
        return e
    }
}, function(e, n, t) {
    var r = t(11),
        o = t(1).document,
        i = r(o) && r(o.createElement);
    e.exports = function(e) {
        return i ? o.createElement(e) : {}
    }
}, function(e, n, t) {
    var r = t(1),
        o = t(2),
        i = t(9),
        a = t(5),
        u = function(e, n, t) {
            var s, c, l, f = e & u.F,
                p = e & u.G,
                d = e & u.S,
                h = e & u.P,
                v = e & u.B,
                g = e & u.W,
                m = p ? o : o[n] || (o[n] = {}),
                y = m.prototype,
                b = p ? r : d ? r[n] : (r[n] || {}).prototype;
            p && (t = n);
            for (s in t)(c = !f && b && void 0 !== b[s]) && s in m || (l = c ? b[s] : t[s], m[s] = p && "function" != typeof b[s] ? t[s] : v && c ? i(l, r) : g && b[s] == l ? function(e) {
                var n = function(n, t, r) {
                    if (this instanceof e) {
                        switch (arguments.length) {
                            case 0:
                                return new e;
                            case 1:
                                return new e(n);
                            case 2:
                                return new e(n, t)
                        }
                        return new e(n, t, r)
                    }
                    return e.apply(this, arguments)
                };
                return n.prototype = e.prototype, n
            }(l) : h && "function" == typeof l ? i(Function.call, l) : l, h && ((m.virtual || (m.virtual = {}))[s] = l, e & u.R && y && !y[s] && a(y, s, l)))
        };
    u.F = 1, u.G = 2, u.S = 4, u.P = 8, u.B = 16, u.W = 32, u.U = 64, u.R = 128, e.exports = u
}, function(e, n, t) {
    var r = t(7).f,
        o = t(10),
        i = t(0)("toStringTag");
    e.exports = function(e, n, t) {
        e && !o(e = t ? e : e.prototype, i) && r(e, i, {
            configurable: !0,
            value: n
        })
    }
}, function(e, n, t) {
    var r = t(30)("keys"),
        o = t(33);
    e.exports = function(e) {
        return r[e] || (r[e] = o(e))
    }
}, function(e, n) {
    var t = Math.ceil,
        r = Math.floor;
    e.exports = function(e) {
        return isNaN(e = +e) ? 0 : (e > 0 ? r : t)(e)
    }
}, function(e, n, t) {
    var r = t(49),
        o = t(15);
    e.exports = function(e) {
        return r(o(e))
    }
}, function(e, n, t) {
    "use strict";
    var r = t(12),
        o = t.n(r),
        i = t(13),
        a = t.n(i),
        u = function() {
            function e() {
                o()(this, e), this.workplace = document, this.body = document.body, this.queryInput = this.workplace.getElementById(e.QUERY_INPUT_ID), this.chatWindow = this.workplace.getElementById(e.CHAT_WINDOW_ID), this.closeWindow = this.workplace.getElementById(e.CLOSE_WINDOW_ID),  this.queryResult = this.workplace.getElementById(e.QUERY_RESULT_ID), this.queryResultWrapper = this.workplace.getElementById(e.QUERY_RESULT_WRAPPER_ID), this.sendBtn = this.workplace.getElementById(e.QUERY_SEND_ID), this.qMenuBtnTR = this.workplace.getElementById(e.QUERY_MENU_ID_TR), this.qMenuBtnBR = this.workplace.getElementById(e.QUERY_MENU_ID_BR), this.chatForm = this.workplace.getElementById(e.CHAT_FORM_ID), this.menuList = this.workplace.getElementById(e.MENU_LIST_ID), this.menuButton = this.workplace.getElementById(e.MENU_BUTTON_ID), this.mainMenu = this.workplace.getElementById(e.MAIN_MENU_ID), this.menuHeight = void 0
            }
            return a()(e, [{
                key: "startWelcome",
                value: function(ben) {
                  setTimeout(function() {
                    ben.handleEvent('startWelcome', 'startWelcome');
                    return
                  }, 0);
                }
            }, {
                key: "restartWelcome",
                value: function(ben) {
                  setTimeout(function() {
                    ben.handleEvent('restartWelcome', 'restartWelcome');
                    return
                  }, 0);
                }
            }, {
                key: "reconnect",
                value: function(ben) {
                  var sess = getSession();
                  setTimeout(function() {
                    ben.handleEvent('reconnect', 'reconnect', null, sess && sess.Pos);
                    return
                  }, 0);
                }
            }, {
                key: "getMenuInputTR",
                value: function() {
                    return this.qMenuBtnTR
                }
            }, {
                key: "getMenuInputBR",
                value: function() {
                    return this.qMenuBtnBR
                }
            }, {
                key: "getSendInput",
                value: function() {
                    return this.sendBtn
                }
            }, {
                key: "getQueryResultWrapper",
                value: function() {
                    return this.queryResultWrapper
                }
            }, {
                key: "getBody",
                value: function() {
                    return this.body
                }
            }, {
                key: "setMenuHeight",
                value: function() {
                    this.mainMenu.style.height = 'auto';
                    this.menuHeight = this.mainMenu.offsetHeight;
                    this.mainMenu.removeAttribute('style');
                }
            }, {
                key: "getChatForm",
                value: function() {
                    return this.chatForm
                }
            }, {
                key: "getMainMenu",
                value: function() {
                    return this.mainMenu
                }
            }, {
                key: "getMenuHeight",
                value: function() {
                    return this.menuHeight + 2
                }
            }, {
                key: "getMenuList",
                value: function() {
                    return this.menuList
                }
            }, {
                key: "getMenuButton",
                value: function() {
                    return this.menuButton
                }
            }, {
                key: "getQueryInput",
                value: function() {
                    return this.queryInput
                }
            }, {
                key: "getWorkplace",
                value: function() {
                    return this.workplace
                }
            }, {
                key: "getCloseWindow",
                value: function() {
                    return this.closeWindow
                }
            }, {
                key: "getChatWindow",
                value: function() {
                    return this.chatWindow
                }
            }, {
                key: "getInputValue",
                value: function() {
                    return this.queryInput.value
                }
            }, {
                key: "setInputValue",
                value: function(e) {
                    return this.queryInput.value = e, this
                }
            }, {
                key: "addUserRequestNode",
                value: function(n, ben) {
                    var t = this.workplace.createElement("div");
                    t.addEventListener('load', function() {
                      var q = this.queryResultWrapper;
                      if (!userScrolledUp || q.scrollHeight - q.scrollTop <= q.clientHeight + 20) {
                        return q.scrollTop = q.scrollHeight, this
                      }
                      return;
                    }, !1);
                    if (n.text) {
                      return t.className = 'user-request-container', t.innerHTML = '<div class="' + e.CLASS_USER_REQUEST + '">' + n.text + '</div>', this.queryResult.appendChild(t), this;
                    } else if (n.input_value && n.id) {
                      var input = ben.domHelper.workplace.getElementById(n.id + '-input');
                      var cnt = ben.domHelper.workplace.getElementById(n.id);
                      if (input) {
                        input.value = n.input_value;
                      }
                      if (cnt) {
                        cnt.classList.remove('icon-send');
                        cnt.classList.add('icon-success');
                      }
                    }
                }
            }, {
                key: "setErrorOnNode",
                value: function(n, t) {
                    return t.innerHTML = n, t.className += " " + e.CLASS_SERVER_RESPONSE_ERROR, t
                }
            }, {
                key: "handleStartSend",
                value: function() {
                    if (!this.sendBtn.classList.contains('icon-send')) {
                      this.sendBtn.classList.add('icon-send');
                    }
                    if (this.sendBtn.classList.contains(e.CLASS_SEND_ACTIVE)) {
                      return this.sendBtn.className, this
                    }
                    return this.sendBtn.className += " " + e.CLASS_SEND_ACTIVE, this
                }
            }, {
                key: "handleStopSend",
                value: function() {
                    if (this.sendBtn.classList.contains('icon-send')) {
                      this.sendBtn.classList.remove('icon-send');
                    }
                    if (!this.sendBtn.classList.contains('icon-stop')) {
                      var n = new RegExp("(?:^|\\s)" + e.CLASS_SEND_ACTIVE + "(?!\\S)", "gi");
                      this.sendBtn.className = this.sendBtn.className.replace(n, "");
                    }
                    return this.sendBtn.className, this
                }
          }, {
                key: "markBodyAsMobile",
                value: function() {
                    this.body.className += "mobile"
                }
            }], [{
                key: "showNode",
                value: function(e) {
                    e.style.display = "block"
                }
            }]), e
        }();
    n.a = u, u.QUERY_INPUT_ID = "query", u.QUERY_RESULT_ID = "result", u.QUERY_RESULT_WRAPPER_ID = "resultWrapper", u.MENU_LIST_ID = "menuList", u.CHAT_WINDOW_ID = "eyChat", u.CLOSE_WINDOW_ID = "eyMobileChatClose", u.MENU_BUTTON_ID = "menuBtn", u.MAIN_MENU_ID = "mainMenu", u.CHAT_FORM_ID = "agentDemoForm", u.QUERY_SEND_ID = "ey-send", u.QUERY_MENU_ID_TR = "ey-menu-tr", u.QUERY_MENU_ID_BR = "ey-menu-br",u.CLASS_SEND_ACTIVE = "active", u.CLASS_USER_REQUEST = "user-request", u.CLASS_SERVER_RESPONSE_ERROR = "server-response-error"
}, function(e, n, t) {
    var r = t(8),
        o = t(0)("toStringTag"),
        i = "Arguments" == r(function() {
            return arguments
        }()),
        a = function(e, n) {
            try {
                return e[n]
            } catch (e) {}
        };
    e.exports = function(e) {
        var n, t, u;
        return void 0 === e ? "Undefined" : null === e ? "Null" : "string" == typeof(t = a(n = Object(e), o)) ? t : i ? r(n) : "Object" == (u = r(n)) && "function" == typeof n.callee ? "Arguments" : u
    }
}, function(e, n) {
    e.exports = "constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")
}, function(e, n) {
    e.exports = function(e) {
        try {
            return !!e()
        } catch (e) {
            return !0
        }
    }
}, function(e, n, t) {
    e.exports = t(1).document && document.documentElement
}, function(e, n, t) {
    "use strict";
    var r = t(28),
        o = t(17),
        i = t(62),
        a = t(5),
        u = t(10),
        s = t(6),
        c = t(52),
        l = t(18),
        f = t(58),
        p = t(0)("iterator"),
        d = !([].keys && "next" in [].keys()),
        h = function() {
            return this
        };
    e.exports = function(e, n, t, v, g, m, y) {
        c(t, n, v);
        var b, _, x, E = function(e) {
                if (!d && e in T) return T[e];
                switch (e) {
                    case "keys":
                    case "values":
                        return function() {
                            return new t(this, e)
                        }
                }
                return function() {
                    return new t(this, e)
                }
            },
            w = n + " Iterator",
            R = "values" == g,
            S = !1,
            T = e.prototype,
            k = T[p] || T["@@iterator"] || g && T[g],
            A = k || E(g),
            O = g ? R ? E("entries") : A : void 0,
            M = "Array" == n ? T.entries || k : k;
        if (M && (x = f(M.call(new e))) !== Object.prototype && (l(x, w, !0), r || u(x, p) || a(x, p, h)), R && k && "values" !== k.name && (S = !0, A = function() {
                return k.call(this)
            }), r && !y || !d && !S && T[p] || a(T, p, A), s[n] = A, s[w] = h, g)
            if (b = {
                    values: R ? A : E("values"),
                    keys: m ? A : E("keys"),
                    entries: O
                }, y)
                for (_ in b) _ in T || i(T, _, b[_]);
            else o(o.P + o.F * (d || S), n, b);
        return b
    }
}, function(e, n) {
    e.exports = !0
}, function(e, n) {
    e.exports = function(e, n) {
        return {
            enumerable: !(1 & e),
            configurable: !(2 & e),
            writable: !(4 & e),
            value: n
        }
    }
}, function(e, n, t) {
    var r = t(1),
        o = r["__core-js_shared__"] || (r["__core-js_shared__"] = {});
    e.exports = function(e) {
        return o[e] || (o[e] = {})
    }
}, function(e, n, t) {
    var r, o, i, a = t(9),
        u = t(48),
        s = t(26),
        c = t(16),
        l = t(1),
        f = l.process,
        p = l.setImmediate,
        d = l.clearImmediate,
        h = l.MessageChannel,
        v = 0,
        g = {},
        m = function() {
            var e = +this;
            if (g.hasOwnProperty(e)) {
                var n = g[e];
                delete g[e], n()
            }
        },
        y = function(e) {
            m.call(e.data)
        };
    p && d || (p = function(e) {
        for (var n = [], t = 1; arguments.length > t;) n.push(arguments[t++]);
        return g[++v] = function() {
            u("function" == typeof e ? e : Function(e), n)
        }, r(v), v
    }, d = function(e) {
        delete g[e]
    }, "process" == t(8)(f) ? r = function(e) {
        f.nextTick(a(m, e, 1))
    } : h ? (o = new h, i = o.port2, o.port1.onmessage = y, r = a(i.postMessage, i, 1)) : l.addEventListener && "function" == typeof postMessage && !l.importScripts ? (r = function(e) {
        l.postMessage(e + "", "*")
    }, l.addEventListener("message", y, !1)) : r = "onreadystatechange" in c("script") ? function(e) {
        s.appendChild(c("script")).onreadystatechange = function() {
            s.removeChild(this), m.call(e)
        }
    } : function(e) {
        setTimeout(a(m, e, 1), 0)
    }), e.exports = {
        set: p,
        clear: d
    }
}, function(e, n, t) {
    var r = t(20),
        o = Math.min;
    e.exports = function(e) {
        return e > 0 ? o(r(e), 9007199254740991) : 0
    }
}, function(e, n) {
    var t = 0,
        r = Math.random();
    e.exports = function(e) {
        return "Symbol(".concat(void 0 === e ? "" : e, ")_", (++t + r).toString(36))
    }
}, function(e, n, t) {
    "use strict";
    var r = t(12),
        o = t.n(r),
        i = t(13),
        a = t.n(i),
        u = t(22),
        s = t(36),
        c = function() {
            function e(n) {
                var t = this;
                o()(this, e), this.domHelper = n, this.handleSend = function(n) {
                    n.preventDefault(), n.stopPropagation(), t.checkWS()
                }, this.handleInputKeyDown = function(n) {
                    n.keyCode === e.KEY_CODES.ENTER && (n.preventDefault(), n.stopPropagation(), t.checkWS(n.target.value))
                }, this.handleInputChange = function(n) {
                    if (n.target.value && n.target.value.length) {
                      t.domHelper.handleStartSend();
                    } else {
                      t.domHelper.handleStopSend();
                    }
                }, this.handleInputFocus = function(n) {
                  window.scrollTo(0, 0);
                  document.body.scrollTop = 0;
                }, this.createElement = function(ty) {
                  var nele = t.domHelper.workplace.createElement(ty);
                  t.scrollToBottomOnLoad(nele);
                  return nele;
                }, this.removeFromParent= function(child) {
                  child.parentNode.removeChild(child);
                  t.scrollToBottom();
                }, this.heartbeat = function() {
                  if (!window.eySocket) return;
                  window.eySocket.heartbeat = true;
                  window.eySocket.send(JSON.stringify(t.buildPayLoad("", "heartbeat")));
                  setTimeout(t.heartbeat, 300000);
                }, this.loadEnv = function() {
                  switch(window.eyEnv) {
                    case 'dev':
                    case 'local':
                    case 'local-chat-dev':
                    case 'local-css-dev':
                    case 'local-dev':
                      wssURL = devURL;
                      break;
                  }
                }, this.initializeWS = function(isRestart) {
                  if (window.eyEnv) {
                    t.loadEnv();
                  }
                  window.eySocket = new WebSocket(wssURL+'?uid='+window.user.userId+'&username='+window.username+'&origin='+(window.origin || 'web')+(window.eyid ? '&guid='+window.eyid : ''));
                  window.eySocket.connectTime = Date.now();
                  window.eySocket.queuedMessages = [];
                  window.eySocket.streamedMessages = [];
                  window.eySocket.isStreaming = false;
                  if (isRestart) {
                    window.eySocket.isStarted = true;
                  } else {
                    window.eySocket.isStarted = false;
                  }
                  if (window.connectAttempts) {
                    window.connectAttempts += 1;
                  } else {
                    window.connectAttempts = 1;
                  }
                  window.eySocket.onerror = t.handleWSError;
                  window.eySocket.onopen = t.handleWSOpen;
                  window.eySocket.onmessage = t.handleWSMessage;
                  window.eySocket.onclose = t.handleWSClose;

                  if (window.eysources.includes("xray-thumbnails")) {
                    initEmptyXraySourceBar();
                  }
                }, this.handleWSClose = function(n) {
                  var now = Date.now();
                  console.log('ws closed');
                  if (window.eySocket && window.eySocket.connectTime && (window.eySocket.connectTime + 8000 < now || window.connectAttempts < 4)) {
                    console.log('reconnecting');
                    setTimeout(function() {
                      t.initializeWS(true);
                    }, 1000);
                  }
                }, this.handleWSError = function(n) {
                  console.error(window.eySocket);
                  throw 'WS error';
                }, this.handleWSOpen = function(n) {
                  if (!window.eySocket.isStarted) {
                    if (window.eyreset) {
                      clearAll();
                      t.domHelper.setInputValue("");
                      t.domHelper.handleStopSend();
                      t.domHelper.restartWelcome(t);
                      window.eyreset = false;
                    } else {
                      var inter = retrieveInteractions(true);
                      setSeen();
                      if (inter && inter.length) {
                        t.loadInteractions(0, inter);
                      } else {
                        t.domHelper.startWelcome(t);
                      }
                      window.eySocket.isStarted = true;
                      t.heartbeat();
                    }
                  } else {
                    t.handleInput(t.domHelper.getInputValue());
                  }
                  if (window.Consent) {
                    t.loadConsent();
                  }
                  if (!window.eySocket.heartbeat) {
                    t.heartbeat();
                  }
                }, this.onFirstClick = function() {
                  if (window.attnElm) {
                    for (var k = 0; k < window.attnElm.childNodes.length; k++) {
                      var bt = window.attnElm.childNodes[k];
                      if (bt && bt.classList.contains('btn--shockwave')) {
                        bt.classList.remove('btn--shockwave');
                        bt.classList.remove('is-active');
                      }
                    }
                    window.attnElm = false;
                  }
                  if (window.videoElm) {
                    t.removeFromParent(window.videoElm);
                    window.videoElm = false;
                  }
                  return false;
                }, this.loadVideo = function() {
                  if (window.eyvideo) {
                    var w = t.domHelper.getChatWindow();
                    window.videoElm = t.createElement('div');
                    window.videoElm.classList.add('ey-class-video-cnt');
                    window.videoElm.onclick = function(e) {
                      e.stopPropagation();
                      e.preventDefault();
                      var vic = t.domHelper.workplace.getElementById('eyVideo');
                      vic.play();
                    };
                    if (window.eyvideo.img) {
                      var pimg = t.createElement('img');
                      pimg.id = 'eyVideoImg';
                      pimg.classList.add('ey-class-video');
                      pimg.src = window.eyvideo.img;
                      window.videoElm.appendChild(pimg);
                    }
                    w.appendChild(window.videoElm);
                    w.onclick = t.onFirstClick;
                  }
                }, this.initVideo = function() {
                  if (window.videoElm) {
                    var vc = t.createElement('video');
                    vc.id = 'eyVideo';
                    vc.preload = true;
                    vc.autoplay = true;
                    vc.loop = false;
                    vc.playsinline = true;
                    vc.classList.add('ey-class-video');
                    vc.addEventListener('play', function(e) {
                      if (window.eyvideo.img) {
                        var pimg = t.domHelper.workplace.getElementById('eyVideoImg');
                        if (pimg) {
                          t.removeFromParent(pimg);
                        }
                      }
                    }, !1);
                    var s1 = t.createElement('source');
                    s1.type = 'video/webm';
                    vc.appendChild(s1);
                    var s2 = t.createElement('source');
                    s2.type = 'video/mp4';
                    s2.src = window.eyvideo.full;
                    vc.appendChild(s2);
                    window.videoElm.appendChild(vc);
                  }
                }, this.feedbackClick = function(turnUUID, response, ty) {
                  switch (ty) {
                    case 'five-scale':
                      var star = t.domHelper.workplace.getElementById(`ai-feedback-prompt`);
                      star.innerHTML = '';
                      for (var st = 1; st < 6; st++) {
                        var star = t.domHelper.workplace.getElementById(`ai-feedback-star-${st}`);
                        if (star) {
                          if (st <= response) {
                            star.classList.remove('ai-feedback-star-inactive');
                            star.classList.add('ai-feedback-star-active');
                          } else {
                            star.classList.remove('ai-feedback-star-active');
                            star.classList.add('ai-feedback-star-inactive');
                          }
                        }
                      }
                      t.scrollToBottom();
                      reportFeedback({
                        rating: response,
                        turnUUID: turnUUID,
                      }, function() {
                        var star = t.domHelper.workplace.getElementById(`ai-feedback-prompt`);
                        star.innerHTML = 'Thanks!';
                        t.scrollToBottom();
                        setTimeout(function() {
                          t.removeFromParent(wid);
                          t.scrollToBottom();
                        }, 3000);
                      });
                      break;
                    default:
                      var wid = t.domHelper.workplace.getElementById('ai-feedback');
                      while (wid.childNodes.length) {
                        t.removeFromParent(wid.childNodes[0]);
                      }
                      if (response == 1) {
                        response = 5;
                      } else {
                        response = 1;
                      }
                      t.scrollToBottom();
                      reportFeedback({
                        rating: response,
                        turnUUID: turnUUID,
                      }, function() {
                        var prompt = t.createElement('div');
                        prompt.classList.add('ai-feedback-prompt');
                        prompt.innerHTML = 'Thanks!';
                        wid.appendChild(prompt);
                        t.scrollToBottom();
                        setTimeout(function() {
                          t.removeFromParent(wid);
                          t.scrollToBottom();
                        }, 3000);
                      });
                  }
                }, this.removeFeedbackWidget = function() {
                  var wid = t.domHelper.workplace.getElementById('ai-feedback');
                  if (wid) {
                    t.removeItem(wid);
                  }
                }, this.updateFeedbackWidget = function(ty) {
                  var aa = t.domHelper.workplace.getElementById('result');
                  if (aa.childNodes.length) {
                    var le = aa.childNodes[aa.childNodes.length - 1];
                    if (le.classList.contains('ai-response')) {
                      var turnUUID = le.getAttribute('data-turn-uuid');
                      if (turnUUID) {
                        t.removeFeedbackWidget();
                        var wid = t.createElement('div');
                        wid.id = 'ai-feedback';
                        wid.classList.add('ai-feedback-container');
                        switch(ty) {
                          case 'five-scale':
                            var pstid = t.createElement('div');
                            pstid.classList.add('ai-feedback-container-stars');
                            var prompt = t.createElement('div');
                            prompt.id = 'ai-feedback-prompt';
                            prompt.classList.add('ai-feedback-prompt');
                            prompt.innerHTML = 'Rate this response: ';
                            pstid.appendChild(prompt);
                            var stid = t.createElement('div');
                            stid.classList.add('ai-feedback-stars');
                            for (var st = 1; st < 6; st++) {
                              var star = t.createElement('div');
                              star.classList.add('ai-feedback-star-inactive');
                              star.id = `ai-feedback-star-${st}`;
                              star.setAttribute('data-turn-uuid', turnUUID);
                              star.onclick = t.feedbackClick.bind(t, turnUUID, st, ty);
                              stid.appendChild(star);
                            }
                            pstid.appendChild(stid);
                            wid.appendChild(pstid);
                            break;
                          default:
                            var prompt = t.createElement('div');
                            prompt.classList.add('ai-feedback-prompt');
                            prompt.innerHTML = 'Was this helpful?';
                            wid.appendChild(prompt);
                            var thumbUp = t.createElement('div');
                            thumbUp.classList.add('ai-feedback-positive');
                            thumbUp.setAttribute('data-turn-uuid', turnUUID);
                            thumbUp.onclick = t.feedbackClick.bind(t, turnUUID, 1);
                            wid.appendChild(thumbUp);
                            var thumbDown = t.createElement('div');
                            thumbDown.classList.add('ai-feedback-negative');
                            thumbDown.setAttribute('data-turn-uuid', turnUUID);
                            thumbDown.onclick = t.feedbackClick.bind(t, turnUUID, -1, ty);
                            wid.appendChild(thumbDown);
                        }
                        aa.appendChild(wid);
                        wid.classList.add('ey-add-item');
                        t.scrollToBottom()
                      }
                    }
                  }
                }, this.handleFeedback = function() {
                  if (doFeedback()) {
                      t.removeFeedbackWidget();
                  }

                    if (doFeedback()) {
                      var ty = feedbackType();
                      switch(ty) {
                        case 'five-scale':
                          setTimeout(function() {
                            t.updateFeedbackWidget(ty);
                          }, 2000);
                          break;
                        case 'binary':
                          setTimeout(function() {
                            t.updateFeedbackWidget(ty);
                          }, 2000);
                      }
                    }

                }, this.initAnimation = function() {
                  window.isInit = true;
                  setTimeout(function() {
                    var le;
                    var aa = t.domHelper.workplace.getElementById('result');
                    if (aa.childNodes.length) {
                      var le = aa.childNodes[aa.childNodes.length - 1];
                      for (var j = aa.childNodes.length - 1; j >= 0; j--) {
                        if (aa.childNodes[j].classList.contains('user-request-container')) {
                          break;
                        } else if (aa.childNodes[j].classList.contains('server-response-container') && !aa.childNodes[j].classList.contains('ey-remove-item')) {
                          le = aa.childNodes[j];
                          break;
                        }
                      }
                      if (le) {
                        var cn = aa.childNodes[j].getElementsByClassName('server-response');
                        if (!cn || !cn.length || cn.length !== 1) {
                          throw 'Unexpected element in initAnimation';
                        } else if (!cn[0].classList.contains('chat-buttons')) {
                          return;
                        }
                        window.attnElm = cn[0];
                        for (var k = 0; k < cn[0].childNodes.length; k++) {
                          var bt = cn[0].childNodes[k];
                          if (!bt || !bt.classList.contains('chat-button')) {
                            throw 'Malformed chat-button';
                          }
                          bt.classList.add('btn--shockwave');
                          bt.classList.add('is-active');
                        }
                        var w = t.domHelper.getChatWindow();
                        w.onclick = t.onFirstClick;
                      }
                    }
                  }, 2000);
                }, this.processQueue = function() {
                  if (window.eySocket.queuedMessages.length) {
                    var wsRes = window.eySocket.queuedMessages.shift();
                    return t.createMessage(wsRes, window.eySocket.typingElement)
                      .then(function(r) {
                        return t.processQueue();
                      });
                  }
                }, this.processStream = function() {
                  if (window.eySocket.streamedMessages.length) {
                    var wsRes = window.eySocket.streamedMessages.shift();
                    originalWsResText += wsRes.text;
                    return t.renderText(wsRes)
                      .then(function(r) {
                        var resText = originalWsResText.replace(/<br \/>/g, '\n');
                        wsRes.container.innerHTML = t.markdownConverter(resText);
                        t.scrollToBottom();
                        return t.processStream();
                      });
                  } else if (!window.eySocket.isStreaming) {
                    originalWsResText = '';
                    t.renderSources(window.eySocket.lastInteraction);
                    window.eySocket.isCancelled = false;
                    t.concludeStream();
                  }
                }, this.renderText = function(msg) {
                  return new Promise(function(resolve) {
                    if (!msg || !msg.text || !msg.container) {
                      window.eySocket.renderingStream = false;
                      resolve();
                      return;
                    }

                    window.eySocket.renderingStream = true;

                    var parts = msg.text.split('<br />');
                    var partIndex = 0;

                    function processPart() {
                      if (partIndex >= parts.length) {
                        window.eySocket.renderingStream = false;
                        resolve();
                        return;
                      }

                      var text = parts[partIndex];

                      setTimeout(function() {
                        msg.container.innerHTML += text;
                        if (partIndex < parts.length - 1) {
                          msg.container.innerHTML += '<br />';
                        }

                        partIndex++;
                        t.scrollToBottom();
                        processPart();
                      }, 1);

                      if (false) {
                        var wordArr = text.split(' ');

                        function processWord(idx) {
                          if (idx < wordArr.length) {
                            setTimeout(function() {
                              msg.container.innerHTML += wordArr[idx];

                              t.scrollToBottom();

                              processWord(idx+1);
                            }, 1);
                          } else {
                            if (partIndex < parts.length - 1) {
                              msg.container.innerHTML += '<br />';
                            }

                            partIndex++;
                            t.scrollToBottom();
                            processPart();
                          }
                        }

                        processWord(0);
                      }
                    }

                    processPart();
                  });
                  }, this.handleWSMessage = function (n) {
                  window.isChatting = false;
                  if (n && n.data) {
                    try {
                      var wsRes = JSON.parse(n.data);
                      saveSession(wsRes.session);
                      if (wsRes) {
                        if (typeof wsRes.isDone === 'undefined') {
                          wsRes.isDone = true;
                        }
                        if (wsRes.isDone) {
                          window.eySocket.isStreaming = false;
                        } else {
                          window.eySocket.isStreaming = true;
                        }
                        if (wsRes.action) {
                          updateUser(wsRes);
                          if (wsRes.action === 'reconnect') {
                            setTransfer(false);
                            var ints = retrieveInteractions(true);
                            if (!ints || !ints.length) {
                              wsRes.sender = "server";
                              if (!window.eySocket.queuedMessages.length) {
                                window.eySocket.queuedMessages.push(wsRes);
                                t.processQueue()
                                  .then(function() {
                                    if (doFeedback()) {
                                      t.handleFeedback();
                                    }
                                    if (!window.isInit) {
                                      if (window.attn) {
                                        t.initAnimation();
                                      }
                                    }
                                  });
                              } else {
                                window.eySocket.queuedMessages.push(wsRes);
                              }
                            } else if (window.eySocket.typingElement) {
                              t.removeItem(window.eySocket.typingElement);
                              delete window.eySocket.typingElement;
                            }
                          } else if (wsRes.action === 'empty') {
                            if (window.eySocket.typingElement) {
                              t.removeItem(window.eySocket.typingElement);
                              delete window.eySocket.typingElement;
                            }
                          } else if (wsRes.action === 'transfer' || wsRes.action === 'reconnect-transfer') {
                            if (window.eySocket.typingElement) {
                              t.removeItem(window.eySocket.typingElement);
                              delete window.eySocket.typingElement;
                            }
                            setTransfer(true);
                          } else if (wsRes.action === 'transfer' || wsRes.action === 'reconnect-transfer-failed') {
                            if (window.eySocket.typingElement) {
                              t.removeItem(window.eySocket.typingElement);
                              delete window.eySocket.typingElement;
                            }
                            setTransfer(false);
                          } else if (wsRes.action === 'reconnect-empty') {
                            if (window.eySocket.typingElement) {
                              t.removeItem(window.eySocket.typingElement);
                              delete window.eySocket.typingElement;
                            }
                            if (!window.isInit) {
                              if (window.attn) {
                                t.initAnimation();
                              }
                            }
                            setTransfer(false);
                          } else if (wsRes.action === 'heartbeat') {
                          } else {
                            if (wsRes.payload) {
                              var wdata = JSON.parse(wsRes.payload);
                              if (wdata && wdata.text && wdata.sender === 'user') {
                                t.saveUserMessage(wdata.text, wsRes.typing);
                                return;
                              }
                            }
                            wsRes.sender = "server";
                            window.eySocket.lastInteraction = wsRes;
                            saveInteraction(wsRes);

                            window.parent.postMessage("alert-update", "*");

                            if (!window.eySocket.queuedMessages.length) {
                              window.eySocket.queuedMessages.push(wsRes);
                              t.processQueue()
                                .then(function() {
                                  if (doFeedback()) {
                                    t.handleFeedback();
                                  }
                                  if (!window.isInit) {
                                    if (window.attn) {
                                      t.initAnimation();
                                    }
                                  }
                                });
                            } else {
                              window.eySocket.queuedMessages.push(wsRes);
                            }
                          }
                        }
                      } else {
                        throw "Invalid WS response payload";
                      }
                    } catch(err) {
                      throw err;
                    }
                  } else {
                      throw "Invalid WS response";
                  }
                }, this.checkWS = function(n) {
                  if (!window.eySocket || window.eySocket.readyState !== 1) {
                    t.initializeWS(window.eySocket ? true : false);
                  } else if (n) {
                    t.handleInput(n);
                  } else {
                    t.handleInput(t.domHelper.getInputValue());
                  }
                }, this.enableMenu = function() {
                  var menuTR = t.domHelper.getMenuInputTR();
                  if (menuTR && menuTR.classList.contains('ey-disabled')) {
                    menuTR.classList.remove('ey-disabled');
                    if (menuTR.parentNode && menuTR.parentNode.classList.contains('ey-disabled')) {
                      menuTR.parentNode.classList.remove('ey-disabled');
                    }
                  }
                  var menuBR = t.domHelper.getMenuInputBR();
                  if (menuBR && menuBR.classList.contains('ey-disabled')) {
                    menuBR.classList.remove('ey-disabled');
                    if (menuBR.parentNode && menuBR.parentNode.classList.contains('ey-disabled')) {
                      menuBR.parentNode.classList.remove('ey-disabled');
                    }
                  }
                }, this.handleMenuClick = function(n) {
                  n.preventDefault();
                  n.stopPropagation();
                  if (!window.eymenu || !window.eymenu.pos || n.target.classList.contains('ey-disabled')) {
                    return;
                  }
                  t.handleEvent('chat', 'chat', null, window.eymenu.pos);
                }, this.handleSendClick = function(n) {
                  n.preventDefault();
                  n.stopPropagation();
                  t.checkWS();
                }, this.handleScrollEvents = function(n) {
                  var q = t.domHelper.getQueryResultWrapper();
                  if (q.scrollHeight - q.scrollTop <= q.clientHeight + 20) {
                    userScrolledUp = false;
                  } else {
                    userScrolledUp = true;
                  }
                }, this.handleCloseWindow = function(n) {
                  n.preventDefault();
                  n.stopPropagation();
                  if (window.videoElm) {
                    t.removeFromParent(window.videoElm);
                    window.videoElm = false;
                  }
                  window.parent.postMessage("close", "*");
                }, this.handleLoad = function() {
                  if (!window.eySocket && window.user && window.user.isTransfer) {
                    t.initializeWS();
                  }
                }, this.handleChatWindow = function(n) {
                  if (n && n.type === "message") {
                    if (n.data) {
                      if (n.data === "open") {
                        window.isOpen = true;
                        if (window.eyvideo) {
                          t.initVideo();
                        }
                        if (!window.eySocket) {
                          t.initializeWS();
                        }
                      } else if (n.data.indexOf && n.data.indexOf("Consent||") === 0) {
                        window.Consent = true;
                        window.ConsentContent = JSON.parse(n.data.replace('Consent||', ''));
                        t.loadConsent();
                      } else if (n.data.indexOf && n.data.indexOf("close") === 0) {
                        window.isOpen = false;
                        if (window.videoElm) {
                          t.removeFromParent(window.videoElm);
                          window.videoElm = false;
                        }
                      } else if (n.data.indexOf && n.data.indexOf("hide close") === 0) {
                        var w = t.domHelper.getCloseWindow();
                        w.style.display = 'none';
                      } else if (n.data.indexOf && n.data.indexOf("show close") === 0) {
                        var w = t.domHelper.getCloseWindow();
                        w.style.display = 'block';
                      }
                    }
                  } else if (window.shouldOpen) {
                    if (!window.eySocket) {
                      t.initializeWS();
                    }
                  }
                }, this.updateResponses = function() {
                    var tc = [];
                    var aa = t.domHelper.workplace.getElementById('result');
                    for (var j = aa.childNodes.length - 1; j >= 0; j--) {
                      if (aa.childNodes[j].classList.contains('user-request-container') || aa.childNodes[j].classList.contains('ey-remove-item')) {
                        break;
                      } else {
                        var cn = aa.childNodes[j].getElementsByClassName('server-response');
                        if (!cn || !cn.length || cn.length !== 1) {
                          console.warn('unexpected element', cn);
                          break;
                        } else if (!cn[0].classList.contains('chat-buttons') && !cn[0].classList.contains('user-input-wrapper')) {
                          tc.push(j);
                        } else {
                          var icon = aa.childNodes[j].getElementsByClassName('server-icon');
                          if (!icon || !icon.length || icon.length !== 1) {
                            console.warn('unexpected element', icon);
                            break;
                          }
                          icon[0].innerHTML = '';
                        }
                      }
                    }
                    for (var k = 0; k < tc.length; k++) {
                      var idx = tc[k];
                      var icon = aa.childNodes[idx].getElementsByClassName('server-icon');
                      if (!icon || !icon.length || icon.length !== 1) {
                        console.warn('unexpected element', icon);
                        break;
                      }
                      if (k > 0) {
                        icon[0].innerHTML = '';
                      } else {
                        icon[0].innerHTML = '<div class="server-icon-img"></div>';
                      }
                    }
                    t.scrollToBottom();
                }, this.loadInteractions = function(idx, inter) {
                  if (idx === inter.length) {
                    return t.domHelper.reconnect(t);
                  }
                  var int1 = inter[idx];
                  window.eySocket.lastInteraction = int1;
                  var pay = JSON.parse(int1.payload);
                  int1.typing = false;
                  if (int1.sender === 'user') {
                    t.domHelper.addUserRequestNode(pay, t);
                    t.loadInteractions(idx + 1, inter);
                  } else {
                    t.createMessage(int1)
                      .then(function(ra0) {
                        return t.loadInteractions(idx + 1, inter);
                      });
                  }
                }, this.scrollToBottomOnLoad = function(obj) {
                  t.scrollToBottom();
                  obj.addEventListener('load', function() {
                    t.scrollToBottom();
                  }, !1);
                }, this.scrollToBottom = function() {
                    var q = t.domHelper.getQueryResultWrapper();
                    if (!userScrolledUp || q.scrollHeight - q.scrollTop <= q.clientHeight + 20) {
                      return q.scrollTop = q.scrollHeight, this
                    }
                    return
                }, this.escapeString = function(txt) {
                  return txt && txt.toString() ? txt.toString().replace(/&/g, "&amp").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;") : txt;
                }, this.loadConsent = function() {
                  var gd = getConsent();
                  if (window.consentLoaded || gd === 'true') {
                  } else if (!window.consentLoaded) {
                    window.consentLoaded = true;
                    var q = t.domHelper.getQueryResultWrapper();
                    q.classList.add('consent-screen');
                    var na = t.createElement('div');
                    na.id = 'consentWindow';
                    na.className = 'ey_result consent-overlay';
                    na.innerHTML = '<div class="consent-container"><table class="ey_result-table"><tr><td id="consentResult"></td></tr></table></div>';
                    q.appendChild(na);
                    t.createMessage(window.ConsentContent, null, true)
                    var ba = t.domHelper.workplace.getElementById('consentWindow');
                  }
                }, this.colorAISource = function(ttt, obj) {
                  var ty = ttt.getAttribute('data-type');
                  switch (ty) {
                    case 'fallback':
                    case 'flow-defined':
                    case 'override':
                      break;
                    case 'gpt3-completion':
                      var na = t.createElement('div');
                      na.classList.add('ai-source');
                      var turnUUID = ttt.getAttribute('data-turn-uuid');
                      if (turnUUID) {
                        if (aiMessages[turnUUID] && aiMessages[turnUUID].length) {
                          var msg = aiMessages[turnUUID][0];
                          if (msg && msg.metadata && msg.metadata.calcScore) {
                            if (msg.metadata.calcScore > 100.00) {
                              na.classList.add('ai-source-high');
                            } else {
                              na.classList.add('ai-source-medium');
                            }
                          } else {
                            na.classList.add('ai-source-medium');
                          }
                        }
                      }
                      obj.appendChild(na);
                      break;
                    case 'gpt3-chitchat':
                      var na = t.createElement('div');
                      na.classList.add('ai-source');
                      na.classList.add('ai-source-gpt3');
                      obj.appendChild(na);
                      break;
                  }
                }, this.addAIMetadata = function(ttt, sess, aiMetadata) {
                  if (sess) {
                    if (!ttt.classList.contains('ai-response')) {
                      ttt.classList.add('ai-response');
                    }

                    var tid = turnUUIDInvert(sess);
                    if (tid) {
                      ttt.setAttribute('data-turn-uuid', tid);
                    }
                    if (aiMetadata && aiMetadata.showSource && aiMetadata.type) {
                      ttt.setAttribute('data-type', aiMetadata.type);
                    }
                  } else if (ttt.classList.contains('ai-response')) {
                    ttt.classList.remove('ai-response');
                  }
                }, this.empty = function(isConsent, sess, aiMetadata, checkTID) {
                    var na = t.createElement('div');
                    na.className = 'server-response-container';
                    t.addAIMetadata(na, sess, aiMetadata);
                    na.innerHTML = '<div class="server-icon"><div class="server-icon-img"></div></div><div class="server-response"><div id="animated-dots" style="display: flex; padding-top: 3px; margin-bottom: -3px;"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>';
                    var aa;
                    if (isConsent) {
                      aa = t.domHelper.workplace.getElementById('consentResult'); 
                    } else {
                      aa = t.domHelper.workplace.getElementById('result');
                    }

                    if (checkTID) {
                      var naa = t.domHelper.workplace.getElementById('stream-' + turnUUIDInvert(sess));
                      if (naa && naa.parentNode.parentNode) {
                        naa.parentNode.parentNode.insertBefore(na, naa.parentNode.nextSibling);
                      } else {
                        aa.appendChild(na);
                      }
                    } else {
                      aa.appendChild(na);
                    }

                    t.scrollToBottom();
                    setTimeout(function() {
                      if (na && na.getElementsByClassName) {
                        const res = na.getElementsByClassName('server-response');
                        if (res && res.length && res.length === 1) {
                          var animatedDots = t.domHelper.workplace.getElementById("animated-dots");
                          if (animatedDots && res[0].contains(animatedDots)) {
                            t.removeItem(na);
                            window.isChatting = false;
                          }
                        }
                      }
                    }, 20000);
                    return na;
                }, this.removeItem = function(nn) {
                    nn.classList.add('ey-remove-item');
                    setTimeout(function() {
                      if (nn && nn.parentNode) {
                        t.removeFromParent(nn);
                      }
                    }, 200);
                }, this.renderSources = function (message) {
                  if (!window.eysources) {
                    return;
                  }

                  if (!message || window.eySocket.isStreaming) {
                    return;
                  }

                  var aiMetadata = message.metadata;

                  if (!aiMetadata || !aiMetadata.searchResults) {
                    return;
                  }

                  var urls = [];

                  var tid = turnUUIDInvert(message.session, true);
                 
                  if (aiMetadata.searchResults) {
                    const aiMetadataSearchResults = [];
  
                    aiMetadata.searchResults.forEach(obj => {
                      if (!obj.boundingBoxes) {
                        aiMetadataSearchResults.push(obj);
                      } else if (obj.pageImages.length === 1) {
                        aiMetadataSearchResults.push(obj);
                      } else {
                        obj.pageImages.forEach(imageUrl => {
                          const newObj = { ...obj, pageImages: [imageUrl] };
                          aiMetadataSearchResults.push(newObj);
                        });
                      }
                    });
  
                    for (var i = 0; i < aiMetadataSearchResults.length; i++) {
                      var searchResultsTempText = "";
                      var fileName = "";
                      var pageImagesUrl = "";
                      var boundingBoxes = [];
                      var suggestedText = "";
                      var documentId = "";
                      var fileKeywords = "";
                      var pageNumberFromUrl = null;
                      var json = null;
                      var narrative = null;
  
                      if (aiMetadataSearchResults[i].documentId) {
                        documentId = aiMetadataSearchResults[i].documentId;
                      }
  
                      if (aiMetadataSearchResults[i].text) {
                        searchResultsTempText = aiMetadataSearchResults[i].text;
                      }
  
                      if (aiMetadataSearchResults[i].suggestedText) {
                        suggestedText = aiMetadataSearchResults[i].suggestedText;
                      }
  
                      if (aiMetadataSearchResults[i].fileKeywords) {
                        fileKeywords = aiMetadataSearchResults[i].fileKeywords;
                      }
  
                      if (aiMetadataSearchResults[i].fileName) {
                        fileName = aiMetadataSearchResults[i].fileName;
                      }
  
                      if (aiMetadataSearchResults[i].pageImages) {
                        pageImagesUrl = aiMetadataSearchResults[i].pageImages[0];
  
                        if (pageImagesUrl) {
                          var parts = pageImagesUrl.split("/");
                          var lastPart = parts[parts.length - 1];
                          var pageNumberStr = lastPart.split(".")[0];
                          pageNumberFromUrl = parseInt(pageNumberStr);
                        }
                      }
  
                      if (aiMetadataSearchResults[i].boundingBoxes) {
                        boundingBoxes = aiMetadataSearchResults[i].boundingBoxes.filter(function (
                          box,
                        ) {
                          return box.pageNumber === pageNumberFromUrl;
                        });
                      }
  
                      if (aiMetadataSearchResults[i].json) {
                        json = aiMetadataSearchResults[i].json;
                      }
  
                      if (aiMetadataSearchResults[i].narrative) {
                        narrative = aiMetadataSearchResults[i].narrative;
                      }
  
                      if (aiMetadataSearchResults[i].sourceUrl) {
                        if (aiMetadataSearchResults[i].sourceUrl) {
                          urls.push({
                            fileName: fileName,
                            text: searchResultsTempText,
                            url: aiMetadataSearchResults[i].sourceUrl,
                            pageImagesUrl: pageImagesUrl,
                            boundingBoxes: boundingBoxes,
                            suggestedText: suggestedText,
                            fileKeywords: fileKeywords,
                            documentId: documentId,
                            json: json,
                            narrative: narrative,
                          });
                        }
                      }
                    }
                  }
                
                  if (urls.length && tid) {
                    var mid = "stream-" + tid;
                    var messageContainer = document.getElementById(mid);
                    if (!messageContainer) {
                      mid = "static-" + tid; 
                      messageContainer = document.getElementById(mid);
                    }
                    if (messageContainer) {
                      var divWithSpans = createClickableSourceURLs(urls, tid);
                      messageContainer.appendChild(divWithSpans);
                    }
                  }

                  return;
                }, this.setText = function(ee, nn, isStreaming, sess) {
                    var sc = nn.getElementsByClassName('server-response');
                    if (!sc || !sc.length || sc.length !== 1) {
                      sc = nn.parentElement.getElementsByClassName('server-response');
                    }

                     if (sc && sc.length && sc.length === 1) { 
                      if (isStreaming) {
                        if (!nn.id) {
                          sc[0].innerHTML = "";
                          var tid = turnUUIDInvert(sess);
                          if (tid) {
                            sc[0].id = 'stream-' + tid;
                          }
                          nn = sc[0];

                          t.addStopStreamingButton();
                        }

                        window.eySocket.streamedMessages.push({
                          container: nn,
                          text: ee,
                        });

                        if (!window.eySocket.renderingStream) {
                          t.processStream();
                        }
                      } else {
                        // non-streaming messages
                        var tid = turnUUIDInvert(sess);
                        if (tid) {
                          sc[0].id = 'static-' + tid;
                        }
                        sc[0].innerHTML = ee;
                        sc[0].innerHTML = t.markdownConverter(sc[0].innerText);
                        t.colorAISource(nn, sc[0]);
                        t.scrollToBottom();
                        return nn, this
                      }
                    } else {
                      console.warn('unexpected response', nn);
                    }
                }, this.setMultimedia = function(ee, nn) {
                    var sc = nn.getElementsByClassName('server-response');
                    if (sc && sc.length && sc.length === 1) {
                      while (sc[0].firstChild) {
                        t.removeFromParent(sc[0].firstChild);
                      }
                      sc[0].classList.add('chat-multimedia');
                      sc[0].appendChild(ee);
                      return nn, this
                    } else {
                      console.warn('unexpected response', nn);
                    }
                }, this.addStopStreamingButton = function() {
                  var eySend = t.domHelper.workplace.getElementById("ey-send");
                  if (!eySend.classList.contains('active')) {
                    eySend.classList.add('active');
                  }
                  if (eySend.classList.contains('icon-send')) {
                    eySend.classList.remove('icon-send');
                  }
                  if (!eySend.classList.contains('icon-stop')) {
                    eySend.classList.add('icon-stop');
                  }
                }, this.concludeStream = function() {
                  var eySend = t.domHelper.workplace.getElementById("ey-send");
                  if (eySend.classList.contains('icon-stop')) {
                    eySend.classList.remove('icon-stop');
                  }
                  if (eySend.classList.contains('active')) {
                    eySend.classList.remove('active');
                  }
                  if (eySend.classList.contains("icon-send")) {
                    eySend.classList.remove('icon-send');
                  }
              }, this.setButtons = function(ee, nn) {
                  var sc = nn.getElementsByClassName('server-response');
                  if (sc && sc.length && sc.length === 1) {
                    while (sc[0].firstChild) {
                      t.removeFromParent(sc[0].firstChild);
                    }

                    var isInput = false;
                    var isHidden = false;
                    for (var i in ee) {
                      if (i == 0 && ee.length === 1) {
                        if (ee[i].classList.contains('user-input-container')) {
                          isInput = true;
                        }
                        if (ee[i].classList.contains('user-input-hidden')) {
                          isHidden = true;
                        }
                      }
                      sc[0].appendChild(ee[i]);
                    }
                    if (isInput) {
                      sc[0].classList.add('user-input-wrapper');
                    } else {
                      sc[0].classList.add('chat-buttons');
                    }
                    if (isHidden) {
                      sc[0].classList.add('user-input-hidden');
                      if (sc[0].parentElement) {
                        sc[0].parentElement.classList.add('user-input-hidden');
                      }
                    }
                    return nn, this
                  } else {
                    console.warn('unexpected response', nn);
                  }
                }, this.stopStreaming = function(n) {
                    var ty = "cancel streaming text"; 
                    t.concludeStream();
                    t.removeFeedbackWidget();
                    window.eySocket.isCancelled = true;
                    window.eySocket.cancelledEmpty = true;
                    if (n) {
                      window.eySocket.cancelledEmpty = false;
                    }
                    setTimeout(function() {
                      if (!window.eySocket.renderingStream && !window.eySocket.isStreaming) {
                        originalWsResText = '';
                        window.eySocket.isCancelled = false;
                      }
                    }, 1000);
                    window.eySocket.send(JSON.stringify(t.buildPayLoad("", ty)));
                    window.parent.postMessage(ty, "*");
                    window.isChatting = false;
              }, this.saveUserMessage = function(n, typing) {
                  t.domHelper.addUserRequestNode({text: escapeAndDecorateString(n)}, t);
                  if (n !== 'startWelcome' && n !== 'restartWelcome' && n !== 'reconnect') {
                    window.eySocket.lastInteraction = { action: "message", payload: JSON.stringify({ text: t.escapeString(n) }), typing: false, sender: "user" };
                    saveInteraction({ action: "message", payload: JSON.stringify({ text: escapeAndDecorateString(n), rawText: n, type: "handleInput" }), typing: false, sender: "user" });
                  }
                  delete window.eySocket.turnType;
                  delete window.eySocket.turnID;
                  if (typing) {
                    window.eySocket.typingElement = t.empty();
                    window.isChatting = true;
                  }
                  t.removeFeedbackWidget();
                  t.scrollToBottom();
                  }, this.handleInput = function (n) {
                  
                  if (window.selectedFiles && window.selectedFiles.length > 0) {
                    for (var i = 0; i < window.selectedFiles.length; i++) {
                      var file = window.selectedFiles[i];
                      if (file.status !== 'uploaded' && !file.uploadedURL) {
                        return;
                      }
                    }
                  }
                  
                  if (window.eySocket.isStreaming || window.eySocket.renderingStream) {
                    t.stopStreaming(n);
                    if (!n) {
                      return;
                    }
                  }

                  if ("" !== n.replace(whiteSpace, "") && !window.isChatting) {
                    var lower = n.toLowerCase().trim();
                    if (lower === 'clear all' || lower === 'reset chat' || lower === 'clear chat' || lower === 'ask another question') {
                      var ty = "clear all";
                      if (lower === 'ask another question') {
                        ty = "clear transfer";
                        clearAll(true);
                      } else {
                        clearAll();
                        t.domHelper.addUserRequestNode({text: 'cleared'}, t);
                      }
                      setTimeout(function() {
                        window.isChatting = true;
                        t.removeFeedbackWidget();
                        window.eySocket.send(JSON.stringify(t.buildPayLoad("", ty)));
                        t.domHelper.setInputValue("");
                        t.domHelper.handleStopSend();
                        window.parent.postMessage(ty, "*");
                        t.scrollToBottom();
                      }, 500);
                    } else if (lower === 'send empty') {
                      setTimeout(function() {
                        window.isChatting = true;
                        t.removeFeedbackWidget();
                        window.eySocket.send(JSON.stringify(t.buildPayLoad("", "")));
                        t.domHelper.setInputValue("");
                        t.domHelper.handleStopSend();
                        t.scrollToBottom();
                      }, 500);
                    } else if (window.eySocket.turnType
                      && window.eySocket.turnID
                      && (window.eySocket.turnType === 'email'
                      || window.eySocket.turnType === 'tel'
                      || window.eySocket.turnType === 'name'
                      || window.eySocket.turnType === 'custom'
                      || window.eySocket.turnType === 'hidden')) {
                      var inBtn = document.getElementById(window.eySocket.turnID);
                      var input = document.getElementById(window.eySocket.turnID + '-input');
                      input.value = n;
                      inBtn.click();
                      t.domHelper.setInputValue("");
                      t.scrollToBottom();
                    } else {
                      t.saveUserMessage(n, true);
                      window.eySocket.send(JSON.stringify(t.buildPayLoad(n)));
                      t.domHelper.setInputValue("");
                      t.domHelper.handleStopSend();
                      t.scrollToBottom();
                    }
                  }
                }, this.sessionId = this.guid(), this.stage = 'welcome', this.nextStage = 'welcome', this.confirmationValue = null, this.menu = null, this.handleMenuButtonClick = function(ben) {
                    if (!t.domHelper.getMainMenu().style.height) {
                      ben.stopPropagation();
                      t.domHelper.getChatForm().classList.add('menu-open');
                      t.domHelper.getMainMenu().style.height = t.domHelper.getMenuHeight() + 'px';
                    }
                }, this.handleBodyClick = function(ben) {
                    if (t.domHelper.getMainMenu().style.height) {
                      ben.stopPropagation();
                      t.domHelper.getChatForm().classList.remove('menu-open');
                      t.domHelper.getMainMenu().removeAttribute('style');
                    }
                }, this.loadMenu = function(menu) {
                  t.domHelper.getMenuButton().style.display = 'block';
                  var futureSteps = false;
                  var mm = t.domHelper.getMenuList();
                  while (mm.firstChild) {
                    t.removeFromParent(mm.firstChild);
                  }
                  for (var i in menu) {
                      if (menu[i].title) {
                          var li = t.createElement('li');
                          if (futureSteps) {
                              li.classList.add('inactive-link');
                          }
                          if (i === t.stage) {
                              li.classList.add('current-link');
                          }
                          li.onclick = t.handleMenuItemClick.bind(t);
                          li.setAttribute('id', i);
                          li.innerHTML = menu[i].title;
                          mm.appendChild(li);
                      }
                      if (i === t.stage) {
                          futureSteps = true;
                      }
                  }
                  t.domHelper.setMenuHeight();
                  t.menu = menu;
                  t.scrollToBottom();
                }, this.makeCopy = function(rr) {
                  return JSON.parse(JSON.stringify(rr));
                }, this.getSpeech = function(n) {
                  return (n.length ? n : [ { speech: e.DEFAULT_NO_ANSWER } ]);
                }, this.chat = {
                    text: function(data, isStreaming) {
                        var html = data;
                        if (!isStreaming) {
                          html = escapeAndDecorateString(data);
                        }
                        html = html.replaceAll("\\n", "<br />");
                        return html.replaceAll("\n", "<br />");
                    }, image: function(data) {
                        var img = t.createElement('img');
                        img.src = data;
                        img.classList.add('chat-image');
                        return img;
                    }, video: function(data) {
                      if (data.indexOf('youtu.be/') > -1 || data.indexOf('youtube.com/watch?v=') > -1) {
                        var cnt = t.createElement('div');
                        cnt.classList.add('youtube-container');
                        var ytPre = '';
                        if (data.indexOf('youtu.be/') > -1) {
                          ytPre = data.replace('https://youtu.be/', '');
                        } else {
                          var ytArr = data.split('youtube.com/watch?v=');
                          if (ytArr.length > 1) {
                            ytPre = ytArr[1];
                          }
                        }
                        if (ytPre) {
                          cnt.innerHTML = '<iframe class="youtube-video" src="https://www.youtube.com/embed/' + ytPre + '" aria-label="Embedded YouTube video" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
                          return cnt;
                        }
                      }
                      return;
                    }, card: function(t, ttt, data, isConsent) {
                      var now = Date.now();
                      var sc = ttt.getElementsByClassName('server-response');
                      if (sc && sc.length && sc.length === 1) {
                        while (sc[0].firstChild) {
                          t.removeFromParent(sc[0].firstChild);
                        }
                      }
                      sc[0].parentElement.classList.add('chat-cards');
                      sc[0].classList.add('card-main');
                      if (data.length === 1){
                        sc[0].classList.add('card-single');
                      }
                      var cardWrap = t.createElement('div');
                      cardWrap.classList.add('card-wrapper');
                      cardWrap.id = 'card-wrap-' + now;
                      var cardInner = t.createElement('div');
                      cardInner.classList.add('card-inner');
                      cardInner.id = 'card-slider-' + now;

                      var indicators = [];
                      for (var idx in data) {
                        var indicator = t.createElement('button');
                        indicator.classList.add('card-indicator');
                        if (indicators.length === 0) {
                          indicator.classList.add('active');
                        }
                        indicator.id = 'indicator-' + idx + '-' + now;
                        indicators.push(indicator);
                        var cd = data[idx];
                        var isEmpty = true;
                        var cardCnt = t.createElement('div');
                        cardCnt.classList.add('card-container');
                        if (cd.image_url) {
                          var imgCnt = t.createElement('div');
                          imgCnt.classList.add('card-image-container');
                          var imgHolder = t.createElement('div');
                          imgHolder.classList.add('card-image-holder');
                          var img = t.createElement('img');
                          img.classList.add('card-image');
                          img.src = cd.image_url;
                          imgHolder.appendChild(img);
                          imgCnt.appendChild(imgHolder);
                          cardCnt.appendChild(imgCnt);
                        }
                        if (cd.title) {
                          var title = t.createElement('div');
                          title.classList.add('card-title');
                          title.innerHTML = cd.title;
                          cardCnt.appendChild(title);
                          isEmpty = false;
                          if (cd.subtitle) {
                            var subtitle = t.createElement('div');
                            subtitle.classList.add('card-subtitle');
                            subtitle.innerHTML = cd.subtitle;
                            cardCnt.appendChild(subtitle);
                          }
                        }
                        if (cd.buttons && cd.buttons.length) {
                          var bt = t.chat.buttons(cd.buttons, idx);
                          if (bt && bt.length) {
                            var buttons = t.createElement('div');
                            buttons.classList.add('card-buttons');
                            buttons.classList.add('chat-buttons');
                            for (var i in bt) {
                              buttons.appendChild(bt[i]);
                            }
                            cardCnt.appendChild(buttons);
                          } else if (isEmpty) {
                            t.removeItem(ttt);
                          }
                        }
                        cardInner.appendChild(cardCnt);
                        cardWrap.appendChild(cardInner);
                        sc[0].appendChild(cardWrap);
                      }
                      if (indicators.length > 1) {
                        var map = t.createElement('div');
                        map.classList.add('card-indicators');
                        map.id = 'card-indicators-' + now;
                        for (var idx in indicators) {
                          map.appendChild(indicators[idx]);
                        }
                        map.addEventListener('click', function(e) {
                          if (e.target.nodeName === 'BUTTON') {
                            for (var idx in indicators) {
                              indicators[idx].classList.remove('active');
                            }
                          }
                          try {
                            var iArr = e.target.id.split('-');
                            if (iArr.length === 3) {
                              var idx = parseInt(iArr[1]);
                              var slider = t.domHelper.workplace.getElementById('card-slider-' + iArr[2]);
                              var xAmt = idx * (-100 / indicators.length);
                              if (!isNaN(xAmt)) {
                                slider.setAttribute('style', 'transform:translateX(' + xAmt + '%);-webkit-transform:translateX(' + xAmt + '%);-moz-transform:translateX(' + xAmt + '%);-ms-transform:translateX(' + xAmt + '%);-o-transform:translateX(' + xAmt + '%);');
                                e.target.classList.add('active');
                              }
                            }
                          } catch(e){}
                        }, supportsPassive() ? {passive : false} : false);
                        map.addEventListener('touchstart', function(e) {
                          if (e.target.nodeName === 'BUTTON') {
                            for (var idx in indicators) {
                              indicators[idx].classList.remove('active');
                            }
                          }
                          try {
                            var iArr = e.target.id.split('-');
                            if (iArr.length === 3) {
                              var idx = parseInt(iArr[1]);
                              var slider = t.domHelper.workplace.getElementById('card-slider-' + iArr[2]);
                              var xAmt = idx * (-100 / indicators.length);
                              if (!isNaN(xAmt)) {
                                slider.setAttribute('style', 'transform:translateX(' + xAmt + '%);-webkit-transform:translateX(' + xAmt + '%);-moz-transform:translateX(' + xAmt + '%);-ms-transform:translateX(' + xAmt + '%);-o-transform:translateX(' + xAmt + '%);');
                                e.target.classList.add('active');
                              }
                            }
                          } catch(e){}
                        }, supportsPassive() ? {passive : false} : false);
                        sc[0].appendChild(map);
                        cardWrap.addEventListener('touchstart', swipeStart, supportsPassive() ? {passive : false} : false);
                        cardWrap.addEventListener('touchend', function(e) {
                          var dir = swipeEnd(e);
                          if (dir !== 'left' && dir !== 'right') {
                            return;
                          }
                          var elem = e.target;
                          var pCnt = 0;
                          while (!elem.classList.contains('card-main') && pCnt < 10) {
                            pCnt += 1;
                            if (elem.id && elem.id.indexOf('card-wrap-') > -1) {
                              break;
                            }
                            elem = elem.parentNode;
                          }
                          if (elem.id && elem.id.indexOf('card-wrap-') > -1) {
                            var nowId = elem.id.replace('card-wrap-', '');
                            var inds = document.getElementById('card-indicators-' + nowId);
                            var activeInds;
                            var cIdx;
                            if (inds.childNodes) {
                              for (var idx in inds.childNodes) {
                                cIdx = idx;
                                activeInds = inds.childNodes[idx];
                                if (activeInds.classList.contains('active')) {
                                  break;
                                }
                              }
                              if (activeInds) {
                                if (dir === 'left') {
                                  var next = parseInt(cIdx)+1;
                                  if (next < inds.childNodes.length) {
                                    var nextBtn = document.getElementById('indicator-' + next + '-' + nowId);
                                    if (nextBtn) {
                                      nextBtn.click();
                                    }
                                  }
                                } else if (dir === 'right') {
                                  var next = parseInt(cIdx)-1;
                                  if (next >= 0) {
                                    var nextBtn = document.getElementById('indicator-' + next + '-' + nowId);
                                    if (nextBtn) {
                                      nextBtn.click();
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }, supportsPassive() ? {passive : false} : false);
                      }
                    }, button: function(data, idx) {
                        var button = t.createElement('button');
                        button.classList.add('chat-button');
                        var objData = data;
                        if (objData.type === 'phone_number') {
                          button.classList.add('click-to-call');
                        } else if (objData.type === 'web_url') {
                          button.classList.add('web-url');
                          button.value = objData.url;
                          objData.payload = objData.url;
                        } else if (objData.type === 'consent') {
                          button.classList.add('consent-button');
                          button.value = objData.value;
                          objData.payload = objData.title;
                        } else {
                          try {
                            var jsonPay = JSON.parse(objData.payload);
                            if (jsonPay && jsonPay.position && (
                              (jsonPay.title && jsonPay.action)
                              || jsonPay.type === 'postback'
                            )) {
                              button.setAttribute('data-flow-uuid', jsonPay.position.flowUUID);
                              button.setAttribute('data-turn-id', jsonPay.position.turnID);
                            }
                            objData.payload = objData.title;
                          } catch (e) {}
                        }
                        var bid = objData.payload;
                        button.setAttribute('data-payload', objData.payload);
                        if (idx) {
                          bid = bid + "-" + idx;
                        }
                        if (bid) {
                          if (objData.type && objData.type === 'web_url') {
                            bid = objData.title + ':' + extractUrl(bid);
                          }
                          var dupeButton = t.domHelper.workplace.getElementById(bid);
                          if (dupeButton) {
                            t.removeFromParent(dupeButton);
                          }
                        }
                        button.setAttribute('id', bid);
                        button.innerHTML = objData.title;
                        button.onclick = t.sendButton.bind(t);
                        return button;
                    }, button_facebook: function(data) {
                        var button = t.createElement('button');
                        button.classList.add('chat-button');
                        button.setAttribute('id', data.intent);
                        button.innerHTML = data.label;
                        button.onclick = t.sendButton.bind(t);
                        return button;
                    }, buttons: function(data, setIdx) {
                        var html = [];
                        for (var i in data) {
                          if (setIdx) {
                            html.push(t.chat.button(data[i], setIdx + '-' + i));
                          } else {
                            html.push(t.chat.button(data[i]));
                          }
                        }
                        return html;
                    }, user_input: function(msg) {
                      var payload = JSON.parse(msg.payload);
                      var data;
                      for (var i in payload.quick_replies) {
                        if (payload.quick_replies[i].content_type
                          && (payload.quick_replies[i].content_type === 'user_email'
                          || payload.quick_replies[i].content_type === 'user_phone_number'
                          || payload.quick_replies[i].content_type === 'custom'
                          || payload.quick_replies[i].content_type === 'hidden')) {
                          if (payload.text.indexOf('Name') > -1) {
                            payload.quick_replies[i].content_type = 'user_name';
                          }
                          data = payload.quick_replies[i];
                          break;
                        }
                      }
                      if (!data) {
                        if (payload.text === 'Name') {
                          data = { content_type: 'user_name' };
                        } else {
                          return;
                        }
                      }
                      var idPrefix;
                      if (msg.id) {
                        idPrefix = msg.id;
                      } else {
                        idPrefix = 'in-' + Date.now();
                        msg.id = idPrefix;
                      }
                      var cnt = t.createElement('div');
                      cnt.classList.add('user-input-container');
                      var holder = t.createElement('div');
                      holder.classList.add('user-input-holder');
                      var input = t.createElement('input');
                      input.classList.add('user-input');
                      input.id = idPrefix + '-input';
                      input.required = true;
                      input.setAttribute('aria-label', payload.text);
                      input.addEventListener("keydown", t.handleInputKeyDown, !1);
                      holder.appendChild(input);
                      var status = t.createElement('div');
                      status.classList.add('user-input-status');
                      status.id = idPrefix + '-status';
                      status.innerHTML = '&nbsp;';
                      var inBtn = t.createElement('div');
                      inBtn.classList.add('user-input-button');
                      inBtn.classList.add('icon-send');
                      inBtn.id = idPrefix;
                      inBtn.onclick = t.inputButton.bind(t);
                      var label = t.createElement('label');
                      label.classList.add('user-input-label');
                      label.innerHTML = payload.text;
                      switch (data.content_type) {
                        case 'user_email':
                          window.eySocket.turnID = idPrefix;
                          window.eySocket.turnType = 'email';
                          inBtn.type = 'email';
                          input.type = 'email';
                          input.autocomplete = 'email';
                          input.name = 'email';
                          holder.appendChild(inBtn);
                          cnt.appendChild(label);
                          cnt.appendChild(holder);
                          break;
                        case 'user_phone_number':
                          window.eySocket.turnID = idPrefix;
                          window.eySocket.turnType = 'tel';
                          inBtn.type = 'tel';
                          input.type = 'tel';
                          input.autocomplete = 'tel';
                          input.name = 'tel';
                          holder.appendChild(inBtn);
                          cnt.appendChild(label);
                          cnt.appendChild(holder);
                          break;
                        case 'user_name':
                          window.eySocket.turnID = idPrefix;
                          window.eySocket.turnType = 'name';
                          inBtn.type = 'name';
                          input.type = 'text';
                          input.autocomplete = 'name';
                          input.name = 'name';
                          holder.appendChild(inBtn);
                          cnt.appendChild(label);
                          cnt.appendChild(holder);
                          break;
                        case 'custom':
                          window.eySocket.turnID = idPrefix;
                          window.eySocket.turnType = 'custom';
                          inBtn.type = 'custom';
                          input.type = 'text';
                          input.name = 'custom';
                          holder.appendChild(inBtn);
                          cnt.appendChild(label);
                          cnt.appendChild(holder);
                          break;
                        case 'hidden':
                          window.eySocket.turnID = idPrefix;
                          window.eySocket.turnType = 'hidden';
                          inBtn.type = 'hidden';
                          input.type = 'text';
                          input.name = 'hidden';
                          cnt.classList.add('user-input-hidden');
                          holder.appendChild(inBtn);
                          cnt.appendChild(label);
                          cnt.appendChild(holder);
                          break;
                        default:
                          return;
                      }
                      cnt.appendChild(status);
                      return cnt;
                    }, quick_reply: function(data) {
                      var objData = data;
                      if (objData.content_type === 'text') {
                        try {
                          var jsonPay = JSON.parse(objData.payload);
                          if (jsonPay && jsonPay.title && jsonPay.action && jsonPay.position) {
                            return t.chat.button({ title: jsonPay.title, type: "postback", payload: objData.payload });
                          }
                        } catch (e) {}
                      } else if (objData.content_type === 'web_url') {
                        if (objData.title && objData.url) {
                          return t.chat.button({ title: objData.title, type: "web_url", payload: objData.url, url: objData.url });
                        }
                      } else if (objData.content_type === 'phone') {
                      if (objData.title && objData.url) {
                        return t.chat.button({ title: objData.title, type: "phone_number", payload: objData.url, url: objData.url });
                      }
                    }
                      var button = t.createElement('button');
                      button.classList.add('chat-button');
                      button.setAttribute('id', objData.payload);
                      button.innerHTML = objData.payload;
                      button.onclick = t.sendButton.bind(t);
                      return button;
                    }, is_input: function(msg) {
                      var data = JSON.parse(msg.payload);
                      if (data.quick_replies) {
                        for (var i in data.quick_replies) {
                          if (data.quick_replies[i].content_type
                            && (data.quick_replies[i].content_type === 'user_email'
                            || data.quick_replies[i].content_type === 'user_phone_number'
                            || data.quick_replies[i].content_type === 'user_name'
                            || data.quick_replies[i].content_type === 'custom'
                            || data.quick_replies[i].content_type === 'hidden')) {
                            return true;
                          }
                        }
                      }
                      if (data.text === 'Name') {
                        return true;
                      }
                      return false;
                    }, quick_replies: function(msg, data) {
                        var html = [];
                        for (var i in data) {
                          if (data[i].content_type) {
                            if (data[i].content_type === 'text' ||
                              data[i].content_type === 'web_url' ||
                              data[i].content_type === 'phone') {
                              html.push(t.chat.quick_reply(data[i]));
                            }
                          }
                        }
                        return html;
                    }
                }, this.isNullObj = function(obj) {
                  return !obj || typeof obj === 'undefined' || typeof obj.classList !== 'object' || typeof obj.classList.contains !== 'function';
                }, this.doReset = function(nr, ttt) {
                  if (nr) {
                    return nr;
                  }
                  if (t.isNullObj(ttt)) {
                    return true;
                  }
                  if (ttt.classList.contains('ey-remove-item')) {
                    return true;
                  }
                  return false;
                }, this.streamButtons = function(html, isConsent, msgSession, aiMetadata, attempt) {
                  if ((!window.eySocket.isStreaming && !window.eySocket.renderingStream) || attempt > 7) {
                    setTimeout(function() {
                      var ttt = t.empty(isConsent, msgSession, aiMetadata, true);
                      t.setButtons(html, ttt);
                      t.updateResponses();
                    }, 500);
                  } else {
                    setTimeout(function() {
                      t.streamButtons(html, isConsent, msgSession, aiMetadata, attempt+1);
                    }, 500);
                  }
                }, this.markdownConverter = function(messageText){
                  messageText = escapeAndDecorateString(messageText, true);
                  if (mdConverter) {
                    var html = mdConverter.makeHtml(messageText);
                    return html;
                  }
                  return messageText;
                }, this.createMessage = function(msg, obj, isConsent) {
                    return new Promise(function(resolve) {
                        var data = {};
                        if (msg && msg.payload) {
                          data = JSON.parse(msg.payload);
                        } else {
                          return resolve();
                        }
                        if (!hasInitMenu) {
                          if (window.eymenu && window.eymenu.activate) {
                            if (msg.position && msg.position.turnID && window.eymenu.activate == msg.position.turnID) {
                              hasInitMenu = true;
                              t.enableMenu();
                            }
                          } else {
                            t.enableMenu();
                            hasInitMenu = true;
                          }
                        }

                        delete window.eySocket.turnType;
                        delete window.eySocket.turnID;

                        var ttt;
                        var needsReset = false;
                        var tid = turnUUIDInvert(msg.session);
                        var existingStream = null;
                        if (tid) {
                          existingStream = document.getElementById('stream-' + tid);
                        }
                        if (t.isNullObj(ttt) && existingStream)  {
                          ttt = existingStream;
                        } else if (t.doReset(needsReset, obj)) {
                          ttt = t.empty(isConsent, msg.metadata);
                          t.addAIMetadata(ttt, msg.session, msg.metadata);
                        } else {
                          ttt = obj;
                          t.addAIMetadata(ttt, msg.session, msg.metadata);
                        }
                        var isStreaming = ttt.id || !msg.isDone;

                        var html = '';
                        if (data.set_attributes) {
                          if (data.set_attributes.event) {
                            window.parent.postMessage('set-event:'+data.set_attributes.event, '*');
                          } else if (data.set_attributes.submit) {
                            window.parent.postMessage('set-event:'+data.set_attributes.submit, '*');
                          } else if (data.set_attributes.jump) {
                            if (data.set_attributes.jump) {
                              try {
                                var jump = JSON.parse(data.set_attributes.jump);
                                if (jump.flowName) {
                                  window.flowname = jump.flowName;
                                }
                              } catch (e) {}
                            }
                          }
                          resolve();
                          return;
                        }
                        if (t.chat.is_input(msg)) {
                          html = t.chat.user_input(msg);
                          if (html) {
                            t.setButtons([html], ttt);
                          } else {
                            t.setText("Unsupported user input type", ttt);
                          }
                        } else {
                          if (data.text) {
                            var html = t.chat.text(data.text, isStreaming);
                            t.setText(html, ttt, isStreaming, msg.session);
                            needsReset = true;
                          }
                          if (data.attachment && data.attachment.payload) {
                            if (data.attachment.payload.text) {
                              if (t.doReset(needsReset, ttt)) {
                                ttt = t.empty(isConsent, msg.session, msg.metadata);
                              }
                              t.setText(t.chat.text(data.attachment.payload.text, isStreaming), ttt, isStreaming, msg.session);
                              needsReset = true;
                            }
                            if (data.attachment.type && data.attachment.type === 'video' && data.attachment.payload.url) {
                              if (t.doReset(needsReset, ttt)) {
                                ttt = t.empty(isConsent, msg.session, msg.metadata);
                              }
                              html = t.chat.video(data.attachment.payload.url);
                              if (html) {
                                ttt.classList.add('chat-video');
                                t.setMultimedia(html, ttt);
                              } else {
                                var btn = t.chat.button({ title: "Watch Video", url: data.attachment.payload.url, type: "web_url" });
                                t.setButtons([btn], ttt);
                              }
                              needsReset = true;
                            }
                            if (data.attachment.type && data.attachment.type === 'image' && data.attachment.payload.url) {
                              if (t.doReset(needsReset, ttt)) {
                                ttt = t.empty(isConsent, msg.session, msg.metadata);
                              }
                              html = t.chat.image(data.attachment.payload.url);
                              t.setMultimedia(html, ttt);
                              needsReset = true;
                            }
                            if (data.attachment.payload.buttons) {
                              html = t.chat.buttons(data.attachment.payload.buttons);
                              if (html && html.length) {
                                if (!window.eySocket.isStreaming && !window.eySocket.renderingStream) {
                                  if (t.doReset(needsReset, ttt)) {
                                    ttt = t.empty(isConsent, msg.session, msg.metadata);
                                  }
                                  t.setButtons(html, ttt);
                                } else {
                                  setTimeout(function() {
                                    if (!t.doReset(needsReset, ttt)) {
                                      t.removeItem(ttt);
                                    }
                                    t.streamButtons(html, isConsent, msg.session, msg.metadata, 0);
                                  }, 500);
                                }
                              } else {
                                if (t.doReset(needsReset, ttt)) {
                                  ttt = t.empty(isConsent, msg.session, msg.metadata);
                                }
                                t.removeItem(ttt);
                              }
                            }
                            if (data.attachment.payload.template_type === 'generic') {
                              html = t.chat.card(t, ttt, data.attachment.payload.elements, isConsent);
                            }
                          }
                          if (data.quick_replies) {
                            if (t.doReset(needsReset, ttt)) {
                              ttt = t.empty(isConsent, msg.session, msg.metadata);
                            }
                            html = t.chat.quick_replies(msg, data.quick_replies);
                            if (html && html.length) {
                              t.setButtons(html, ttt);
                            } else {
                              t.removeItem(ttt);
                            }
                          }
                        }

                        t.renderSources(msg);
                        t.updateResponses();
                        if (msg && msg.typing && msg.isDone) {
                          if (!window.eySocket.typingElement || needsReset) {
                            window.eySocket.typingElement = t.empty(isConsent, msg.session, msg.metadata);
                          }
                        } else if (!window.eySocket.cancelledEmpty) {
                          if (!window.eySocket.isCancelled) {
                            window.eySocket.cancelledEmpty = true;
                            window.eySocket.typingElement = null;
                          }
                        } else {
                          window.eySocket.typingElement = null;
                        }
                        resolve();
                    });
                }
            }
            return a()(e, [{
                key: "bindEventHandlers",
                value: function() {
                    if (this.domHelper.getMenuInputTR()) {
                      this.domHelper.getMenuInputTR().addEventListener("click", this.handleMenuClick, supportsPassive() ? {passive : false} : false);
                    }
                    if (this.domHelper.getMenuInputBR()) {
                      this.domHelper.getMenuInputBR().addEventListener("click", this.handleMenuClick, supportsPassive() ? {passive : false} : false);
                    }
                    if (this.domHelper.getQueryInput()) {
                      this.domHelper.getQueryInput().addEventListener("keydown", this.handleInputKeyDown, supportsPassive() ? {passive : false} : false),
                      window.addEventListener("message", this.handleChatWindow, !1),
                      this.domHelper.getCloseWindow().addEventListener("click", this.handleCloseWindow, supportsPassive() ? {passive : false} : false),
                      this.domHelper.getCloseWindow().addEventListener("touchstart", this.handleCloseWindow, supportsPassive() ? {passive : false} : false),
                      this.domHelper.getQueryResultWrapper().addEventListener("scroll", this.handleScrollEvents, supportsPassive() ? {passive : false} : false),
                      this.domHelper.getQueryInput().addEventListener("input", this.handleInputChange, supportsPassive() ? {passive : false} : false),
                      this.domHelper.getSendInput().addEventListener("click", this.handleSendClick, supportsPassive() ? {passive : false} : false),
                      this.domHelper.getSendInput().addEventListener("touchstart", this.handleSendClick, supportsPassive() ? {passive : false} : false), window.shouldOpen && this.handleChatWindow(),
                      this.domHelper.getQueryInput().addEventListener("focus", this.handleInputFocus, supportsPassive() ? {passive : false} : false),
                      this.loadVideo(),
                      this.handleLoad()
                    }
                }
            }, {
                key: "handleMenuItemClick",
                value: function(ben) {
                    ben.stopPropagation();
                    if (ben.target.className !== 'current-link'
                        && ben.target.className !== 'inactive-link') {
                        var i = this.getSpeech(this.menu[ben.target.id].result);
                        this.stage = ben.target.id;
                        this.nextStage = this.menu[ben.target.id].nextStage;
                        if (this.menu) {
                            this.loadMenu(this.menu);
                        }
                        this.printMessage(i);
                    }
                }
            }, {
                key: "inputButton",
                value: function(ee) {
                  if (!ee.target.classList.contains('icon-success')) {
                    var input = document.getElementById(ee.target.id + '-input');
                    var status = document.getElementById(ee.target.id + '-status');
                    status.innerHTML = '&nbsp;';
                    var inputVal = input.value;
                    if (!inputVal) {
                      this.scrollToBottom();
                      return;
                    }
                    inputVal = inputVal.replace(whiteSpace, "");
                    if (!inputVal) {
                      this.scrollToBottom();
                      return;
                    }
                    switch (ee.target.type) {
                      case 'email':
                        if (/^[\w+]+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/.test(inputVal)) {
                          ee.target.classList.remove('icon-send');
                          ee.target.classList.add('icon-success');
                          var ae = this;
                          setTimeout(function() {
                            ae.handleEvent(inputVal, 'user_input', ee.target.id);
                          }, 250);
                        } else {
                          status.innerHTML = 'Invalid Email';
                        }
                        break;
                      case 'tel':
                        var testNum;
                        if (phoneNumberParser) {
                          testNum = phoneNumberParser(inputVal, 'US');
                        } else {
                          testNum = inputVal.replace(/\D+/gm, '');
                          if (testNum && testNum > 6) {
                            testNum = true;
                          } else {
                            testNum = false;
                          }
                        }
                        if (testNum) {
                          ee.target.classList.remove('icon-send');
                          ee.target.classList.add('icon-success');
                          var ae = this;
                          setTimeout(function() {
                            ae.handleEvent(inputVal, 'user_input', ee.target.id);
                          }, 250);
                        } else {
                          status.innerHTML = 'Invalid US Phone Number';
                        }
                        break;
                      case 'name':
                        var inArr = inputVal.split(' ');
                        if (/^[a-zA-Z ]+$/.test(inputVal) && inputVal.length > 2 && inArr.length < 5) {
                          ee.target.classList.remove('icon-send');
                          ee.target.classList.add('icon-success');
                          var ae = this;
                          setTimeout(function() {
                            ae.handleEvent(inputVal, 'user_input', ee.target.id);
                          }, 250);
                        } else {
                          status.innerHTML = 'Invalid Name';
                        }
                        break;
                      case 'hidden':
                      case 'custom':
                          if (inputVal.length > 0) {
                            ee.target.classList.remove('icon-send');
                            ee.target.classList.add('icon-success');
                            var ae = this;
                            setTimeout(function() {
                              ae.handleEvent(inputVal, 'user_input', ee.target.id);
                            }, 250);
                          } else {
                            status.innerHTML = 'Invalid Input';
                          }
                          break;
                      default:
                        break;
                    }
                    this.scrollToBottom();
                  }
                }
            }, {
                key: "sendButton",
                value: function(ee) {
                  if (ee.target.classList.contains('click-to-call')) {
                    var aa = this.createElement('a');
                    var splitNum = ee.target.id.split('url=');
                    if (splitNum.length === 2) {
                      aa.href = decodeURIComponent(splitNum[1].split('&')[0]);
                    } else {
                      aa.href = 'tel:' + ee.target.id;
                    }
                    aa.click();
                    this.handleEvent(aa.href);
                  } else if (ee.target.classList.contains('web-url')) {
                    var curl = ee.target.value;
                    if (isiOS()) {
                      if (curl.indexOf('.pdf#page=') > -1) {
                        curl = curl.replace('.pdf#page=', '.pdf#page');
                      } else if (curl.indexOf('.pdf%23page%3D') > -1) {
                        curl = curl.replace('.pdf%23page%3D', '.pdf%23page');
                      }
                    }
                    var aa = this.createElement('a');
                    aa.href = curl;
                    aa.target = '_blank';
                    aa.click();
                    this.handleEvent('web}'+curl);
                  } else if (ee.target.classList.contains('consent-button')) {
                    if (ee.target.value === 'true') {
                      saveConsent(ee.target.value);
                      var gw = document.getElementById('consentWindow');
                      if (gw) {
                        gw.parentNode.classList.remove('consent-screen');
                        t.removeFromParent(gw);
                      }
                    } else {
                      window.parent.postMessage('close', '*');
                    }
                  } else {
                    delete window.eySocket.turnType;
                    delete window.eySocket.turnID;
                    var flowUUID = ee.target.getAttribute('data-flow-uuid');
                    var turnID = parseInt(ee.target.getAttribute('data-turn-id'));
                    var objId = ee.target.id;
                    var pay = ee.target.getAttribute('data-payload');
                    if (pay) {
                      objId = pay;
                    }
                    var pos;
                    if (flowUUID && turnID && !isNaN(turnID)) {
                      pos = { flowUUID: flowUUID, turnID: turnID };
                    }
                    var dt = ee.target.outerHTML || null;
                    this.handleEvent(objId, null, dt, pos);
                  }
                }
            }, {
                key: "facebookButton",
                value: function(ee) {
                    var t = this;
                    t.removeFromParent(ee.target.parentElement);
                    window.isChatting = true;
                    t.removeFeedbackWidget();
                    FB.login(function(res) {
                        if (res.authResponse && res.status && res.status === 'connected') {
                            t.handleEvent(ee.target.id, 'switch', res.authResponse);
                        } else {
                            var r = t.empty();
                            t.domHelper.setErrorOnNode('You will have to login and grant authorization to continue.', r);
                            var rr = t.makeCopy(t.menu[t.stage].repeat.result);
                            var i = t.getSpeech(rr);
                            t.printMessage(i);
                        }
                        window.isChatting = false;
                    }, {scope: 'email,public_profile,pages_show_list', auth_type: 'rerequest'});
                }
            }, {
                key: "handleEvent",
                value: function(evt, type, dt, pos) {
                  if (!window.isChatting) {
                    var t = this;
                    var txt = evt || t.domHelper.getInputValue();
                    var shouldSend = true;
                    if (txt !== 'startWelcome' && txt !== 'restartWelcome' && txt !== 'reconnect' && type !== 'user_input' && type !== 'chat') {
                      if (window.eySocket.turnType
                        && window.eySocket.turnID
                        && (window.eySocket.turnType === 'email'
                        || window.eySocket.turnType === 'tel'
                        || window.eySocket.turnType === 'name'
                        || window.eySocket.turnType === 'custom'
                        || window.eySocket.turnType === 'hidden')) {
                        shouldSend = false;
                        var inBtn = document.getElementById(window.eySocket.turnId);
                        var input = document.getElementById(window.eySocket.turnId + '-input');
                        input.value = n;
                        inBtn.click();
                        if (window.eySocket.turnType === 'hidden') {
                          t.domHelper.addUserRequestNode({text: txt}, t);
                          window.eySocket.lastInteraction = { action: "message", payload: JSON.stringify({ text: txt }), typing: false, sender: "user" };
                          saveInteraction({ action: "message", payload: JSON.stringify({ text: txt, rawText: evt, type: "handleEvent", buttonType: type, dt: dt, pos: pos }), typing: false, sender: "user" });
                        }
                      } else {
                        if (txt.indexOf('tel:') < 0) {
                          if (txt.indexOf('web}') < 0) {
                            t.domHelper.addUserRequestNode({text: txt}, t);
                            window.eySocket.lastInteraction = { action: "message", payload: JSON.stringify({ text: txt }), typing: false, sender: "user" };
                            saveInteraction({ action: "message", payload: JSON.stringify({ text: txt, rawText: evt, type: "handleEvent", buttonType: type, dt: dt, pos: pos }), typing: false, sender: "user" });
                          } else {
                            shouldSend = false;
                          }
                        } else {
                          shouldSend = false;
                        }
                      }
                    } else if (type === 'user_input') {
                      saveInteraction({ action: "input_value", payload: JSON.stringify({ input_value: txt, id: dt }), typing: false, sender: "user" });
                      dt = null;
                      if (window.eySocket.turnType === 'hidden') {
                        t.domHelper.addUserRequestNode({text: txt}, t);
                        window.eySocket.lastInteraction = { action: "message", payload: JSON.stringify({ text: txt }), typing: false, sender: "user" };
                      }
                    }
                    if (shouldSend) {
                      window.eySocket.typingElement = t.empty();
                      if (txt === 'reconnect' && window.eySocket.lastInteraction && t.chat.is_input(window.eySocket.lastInteraction)) {
                      } else {
                        delete window.eySocket.turnType;
                        delete window.eySocket.turnID;
                      }
                      window.isChatting = true;
                      t.removeFeedbackWidget();
                      window.eySocket.send(JSON.stringify(t.buildPayLoad(evt || t.domHelper.getInputValue(), type || 'event', dt, pos)));
                    }
                    t.scrollToBottom();
                  }
                }
            }, {
                key: "buildPayLoad",
                value: function(e, ty, dt, pos) {
                    var inputVal = e;
                    if (!inputVal && !ty) {
                      return;
                    }
                    inputVal = inputVal.replace(whiteSpace, "");
                    if (!inputVal && !ty) {
                      return;
                    }
                    var sess = getSession();
                    if (sess) {
                      sess = JSON.stringify(sess);
                    }
                  
                    var attachmentsArray = [];
                    if (window.selectedFiles && window.selectedFiles.length > 0) {
                      for (var i = 0; i < window.selectedFiles.length; i++) {
                        var file = window.selectedFiles[i];
                        if (file.status === 'uploaded' && file.uploadedURL) {
                          attachmentsArray.push(file.uploadedURL);
                        }
                      }
                    }
                    var ben = {
                        cref: window.eyref && window.eyref,
                        data: inputVal,
                        email: window.eyemail,
                        fullName: window.eyname,
                        guid: window.eyid && window.eyid,
                        modelId: window.modelId,
                        origin: window.origin || 'web',
                        path: window.location.pathname,
                        phone: window.eyphone,
                        position: pos && pos,
                        ref: window.location.href,
                        session: sess,
                        type: ty || 'text',
                        uid: window.user.userId,
                        username: window.username,
                        attachments: attachmentsArray,
                    };
                    window.selectedFiles = [];
                    renderFiles();
                    if (typeof window.flowname !== 'undefined') {
                      ben.flowname = window.flowname;
                    }
                    if (this.confirmationValue) {
                        ben.value.passthrough.confirmationValue = this.confirmationValue;
                    }
                    if (dt) {
                        if (ben.value) {
                          ben.value.passthrough.request = dt;
                        } else {
                          ben.value = { passthrough: dt };
                        }
                    }
                    return ben;
                }
            }, {
                key: "generateCallbacksForNode",
                value: function(e) {
                    var n = this;
                    return {
                        success: function(t) {
                            n.handleResponse(t, e)
                        },
                        error: function(t) {
                            n.handleResponse(t, e)
                        }
                    }
                }
            }, {
                key: "handleError",
                value: function(n, t) {
                    var r = null;
                    r = n && n.status && n.status.errorDetails ? n.status.errorDetails : e.DEFAULT_ERROR, this.domHelper.setErrorOnNode(r, t)
                }
            }, {
                key: "guid",
                value: function() {
                    var e = function() {
                        return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1)
                    };
                    return e() + e() + "-" + e() + "-" + e() + "-" + e() + "-" + e() + e() + e()
                }
            }]), e
        }();
    n.a = c, c.DEFAULT_ERROR = "Sorry, it seems like there was an error during the request.", c.DEFAULT_NO_ANSWER = "[empty response]", c.HTTP_STATUS = {
        OK: 200
    }, c.KEY_CODES = {
        ENTER: 13
    }
}, function(e, n, t) {
    var r = t(76);
    "string" == typeof r && (r = [
        [e.i, r, ""]
    ]);
    t(78)(r, {});
    r.locals && (e.exports = r.locals)
}, function(e, n, t) {
    "use strict";
    var r = t(37),
        o = t.n(r),
        i = t(39),
        a = t.n(i),
        u = t(12),
        s = t.n(u),
        c = t(13),
        l = t.n(c),
        f = function() {
            function e() {
                s()(this, e)
            }
            return l()(e, null, [{
                key: "ajax",
                value: function(n, t) {
                    var r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null,
                        i = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : null;
                    return new a.a(function(a, u) {
                        var s = e.createXMLHTTPObject(),
                            c = t,
                            l = null;
                        if (r && n === e.Method.GET) {
                            c += "?";
                            var f = 0;
                            for (var p in r) r.hasOwnProperty(p) && (f++ && (c += "&"), c += encodeURIComponent(p) + "=" + encodeURIComponent(r[p]))
                        } else r && (i || (i = {}), i["Content-Type"] = "application/json", l = o()(r));
                        if (s.open(n, c), i)
                            for (var d in i) i.hasOwnProperty(d) && s.setRequestHeader(d, i[d]);
                        l ? s.send(l) : s.send(), s.onload = function() {
                            s.status >= 200 && s.status < 300 ? a(s) : u(s)
                        }, s.onerror = function() {
                            u(s)
                        }
                    })
                }
            }, {
                key: "get",
                value: function(n) {
                    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null,
                        r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null;
                    return e.ajax(e.Method.GET, n, t, r)
                }
            }, {
                key: "post",
                value: function(n) {
                    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null,
                        r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null;
                    return e.ajax(e.Method.POST, n, t, r)
                }
            }, {
                key: "put",
                value: function(n) {
                    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null,
                        r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null;
                    return e.ajax(e.Method.PUT, n, t, r)
                }
            }, {
                key: "delete",
                value: function(n) {
                    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null,
                        r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null;
                    return e.ajax(e.Method.DELETE, n, t, r)
                }
            }, {
                key: "createXMLHTTPObject",
                value: function() {
                    for (var n = null, t = 0; t < e.XMLHttpFactories.length; t++)
                        if (e.XMLHttpFactories.hasOwnProperty(t)) {
                            try {
                                n = e.XMLHttpFactories[t]()
                            } catch (e) {
                                continue
                            }
                            break
                        }
                    return n
                }
            }]), e
        }();
    f.XMLHttpFactories = [function() {
            return new XMLHttpRequest
        }, function() {
            return new ActiveXObject("Msxml2.XMLHTTP")
        }, function() {
            return new ActiveXObject("Msxml3.XMLHTTP")
        }, function() {
            return new ActiveXObject("Microsoft.XMLHTTP")
        }],
        function(e) {
            ! function(e) {
                e[e.GET = "GET"] = "GET", e[e.POST = "POST"] = "POST", e[e.PUT = "PUT"] = "PUT", e[e.DELETE = "DELETE"] = "DELETE"
            }(e.Method || (e.Method = {}))
        }(f || (f = {})), n.a = f
}, function(e, n, t) {
    e.exports = {
        default: t(40),
        __esModule: !0
    }
}, function(e, n, t) {
    e.exports = {
        default: t(41),
        __esModule: !0
    }
}, function(e, n, t) {
    e.exports = {
        default: t(42),
        __esModule: !0
    }
}, function(e, n, t) {
    var r = t(2),
        o = r.JSON || (r.JSON = {
            stringify: JSON.stringify
        });
    e.exports = function(e) {
        return o.stringify.apply(o, arguments)
    }
}, function(e, n, t) {
    t(71);
    var r = t(2).Object;
    e.exports = function(e, n, t) {
        return r.defineProperty(e, n, t)
    }
}, function(e, n, t) {
    t(72), t(74), t(75), t(73), e.exports = t(2).Promise
}, function(e, n) {
    e.exports = function() {}
}, function(e, n) {
    e.exports = function(e, n, t, r) {
        if (!(e instanceof n) || void 0 !== r && r in e) throw TypeError(t + ": incorrect invocation!");
        return e
    }
}, function(e, n, t) {
    var r = t(21),
        o = t(32),
        i = t(66);
    e.exports = function(e) {
        return function(n, t, a) {
            var u, s = r(n),
                c = o(s.length),
                l = i(a, c);
            if (e && t != t) {
                for (; c > l;)
                    if ((u = s[l++]) != u) return !0
            } else
                for (; c > l; l++)
                    if ((e || l in s) && s[l] === t) return e || l || 0; return !e && -1
        }
    }
}, function(e, n, t) {
    var r = t(9),
        o = t(51),
        i = t(50),
        a = t(3),
        u = t(32),
        s = t(69),
        c = {},
        l = {},
        n = e.exports = function(e, n, t, f, p) {
            var d, h, v, g, m = p ? function() {
                    return e
                } : s(e),
                y = r(t, f, n ? 2 : 1),
                b = 0;
            if ("function" != typeof m) throw TypeError(e + " is not iterable!");
            if (i(m)) {
                for (d = u(e.length); d > b; b++)
                    if ((g = n ? y(a(h = e[b])[0], h[1]) : y(e[b])) === c || g === l) return g
            } else
                for (v = m.call(e); !(h = v.next()).done;)
                    if ((g = o(v, y, h.value, n)) === c || g === l) return g
        };
    n.BREAK = c, n.RETURN = l
}, function(e, n, t) {
    e.exports = !t(4) && !t(25)(function() {
        return 7 != Object.defineProperty(t(16)("div"), "a", {
            get: function() {
                return 7
            }
        }).a
    })
}, function(e, n) {
    e.exports = function(e, n, t) {
        var r = void 0 === t;
        switch (n.length) {
            case 0:
                return r ? e() : e.call(t);
            case 1:
                return r ? e(n[0]) : e.call(t, n[0]);
            case 2:
                return r ? e(n[0], n[1]) : e.call(t, n[0], n[1]);
            case 3:
                return r ? e(n[0], n[1], n[2]) : e.call(t, n[0], n[1], n[2]);
            case 4:
                return r ? e(n[0], n[1], n[2], n[3]) : e.call(t, n[0], n[1], n[2], n[3])
        }
        return e.apply(t, n)
    }
}, function(e, n, t) {
    var r = t(8);
    e.exports = Object("z").propertyIsEnumerable(0) ? Object : function(e) {
        return "String" == r(e) ? e.split("") : Object(e)
    }
}, function(e, n, t) {
    var r = t(6),
        o = t(0)("iterator"),
        i = Array.prototype;
    e.exports = function(e) {
        return void 0 !== e && (r.Array === e || i[o] === e)
    }
}, function(e, n, t) {
    var r = t(3);
    e.exports = function(e, n, t, o) {
        try {
            return o ? n(r(t)[0], t[1]) : n(t)
        } catch (n) {
            var i = e.return;
            throw void 0 !== i && r(i.call(e)), n
        }
    }
}, function(e, n, t) {
    "use strict";
    var r = t(56),
        o = t(29),
        i = t(18),
        a = {};
    t(5)(a, t(0)("iterator"), function() {
        return this
    }), e.exports = function(e, n, t) {
        e.prototype = r(a, {
            next: o(1, t)
        }), i(e, n + " Iterator")
    }
}, function(e, n, t) {
    var r = t(0)("iterator"),
        o = !1;
    try {
        var i = [7][r]();
        i.return = function() {
            o = !0
        }, Array.from(i, function() {
            throw 2
        })
    } catch (e) {}
    e.exports = function(e, n) {
        if (!n && !o) return !1;
        var t = !1;
        try {
            var i = [7],
                a = i[r]();
            a.next = function() {
                return {
                    done: t = !0
                }
            }, i[r] = function() {
                return a
            }, e(i)
        } catch (e) {}
        return t
    }
}, function(e, n) {
    e.exports = function(e, n) {
        return {
            value: n,
            done: !!e
        }
    }
}, function(e, n, t) {
    var r = t(1),
        o = t(31).set,
        i = r.MutationObserver || r.WebKitMutationObserver,
        a = r.process,
        u = r.Promise,
        s = "process" == t(8)(a);
    e.exports = function() {
        var e, n, t, c = function() {
            var r, o;
            for (s && (r = a.domain) && r.exit(); e;) {
                o = e.fn, e = e.next;
                try {
                    o()
                } catch (r) {
                    throw e ? t() : n = void 0, r
                }
            }
            n = void 0, r && r.enter()
        };
        if (s) t = function() {
            a.nextTick(c)
        };
        else if (i) {
            var l = !0,
                f = document.createTextNode("");
            new i(c).observe(f, {
                characterData: !0
            }), t = function() {
                f.data = l = !l
            }
        } else if (u && u.resolve) {
            var p = u.resolve();
            t = function() {
                p.then(c)
            }
        } else t = function() {
            o.call(r, c)
        };
        return function(r) {
            var o = {
                fn: r,
                next: void 0
            };
            n && (n.next = o), e || (e = o, t()), n = o
        }
    }
}, function(e, n, t) {
    var r = t(3),
        o = t(57),
        i = t(24),
        a = t(19)("IE_PROTO"),
        u = function() {},
        s = function() {
            var e, n = t(16)("iframe"),
                r = i.length;
            for (n.style.display = "none", t(26).appendChild(n), n.src = "javascript:", e = n.contentWindow.document, e.open(), e.write("<script>document.F=Object<\/script>"), e.close(), s = e.F; r--;) delete s.prototype[i[r]];
            return s()
        };
    e.exports = Object.create || function(e, n) {
        var t;
        return null !== e ? (u.prototype = r(e), t = new u, u.prototype = null, t[a] = e) : t = s(), void 0 === n ? t : o(t, n)
    }
}, function(e, n, t) {
    var r = t(7),
        o = t(3),
        i = t(60);
    e.exports = t(4) ? Object.defineProperties : function(e, n) {
        o(e);
        for (var t, a = i(n), u = a.length, s = 0; u > s;) r.f(e, t = a[s++], n[t]);
        return e
    }
}, function(e, n, t) {
    var r = t(10),
        o = t(67),
        i = t(19)("IE_PROTO"),
        a = Object.prototype;
    e.exports = Object.getPrototypeOf || function(e) {
        return e = o(e), r(e, i) ? e[i] : "function" == typeof e.constructor && e instanceof e.constructor ? e.constructor.prototype : e instanceof Object ? a : null
    }
}, function(e, n, t) {
    var r = t(10),
        o = t(21),
        i = t(45)(!1),
        a = t(19)("IE_PROTO");
    e.exports = function(e, n) {
        var t, u = o(e),
            s = 0,
            c = [];
        for (t in u) t != a && r(u, t) && c.push(t);
        for (; n.length > s;) r(u, t = n[s++]) && (~i(c, t) || c.push(t));
        return c
    }
}, function(e, n, t) {
    var r = t(59),
        o = t(24);
    e.exports = Object.keys || function(e) {
        return r(e, o)
    }
}, function(e, n, t) {
    var r = t(5);
    e.exports = function(e, n, t) {
        for (var o in n) t && e[o] ? e[o] = n[o] : r(e, o, n[o]);
        return e
    }
}, function(e, n, t) {
    e.exports = t(5)
}, function(e, n, t) {
    "use strict";
    var r = t(1),
        o = t(2),
        i = t(7),
        a = t(4),
        u = t(0)("species");
    e.exports = function(e) {
        var n = "function" == typeof o[e] ? o[e] : r[e];
        a && n && !n[u] && i.f(n, u, {
            configurable: !0,
            get: function() {
                return this
            }
        })
    }
}, function(e, n, t) {
    var r = t(3),
        o = t(14),
        i = t(0)("species");
    e.exports = function(e, n) {
        var t, a = r(e).constructor;
        return void 0 === a || void 0 == (t = r(a)[i]) ? n : o(t)
    }
}, function(e, n, t) {
    var r = t(20),
        o = t(15);
    e.exports = function(e) {
        return function(n, t) {
            var i, a, u = String(o(n)),
                s = r(t),
                c = u.length;
            return s < 0 || s >= c ? e ? "" : void 0 : (i = u.charCodeAt(s), i < 55296 || i > 56319 || s + 1 === c || (a = u.charCodeAt(s + 1)) < 56320 || a > 57343 ? e ? u.charAt(s) : i : e ? u.slice(s, s + 2) : a - 56320 + (i - 55296 << 10) + 65536)
        }
    }
}, function(e, n, t) {
    var r = t(20),
        o = Math.max,
        i = Math.min;
    e.exports = function(e, n) {
        return e = r(e), e < 0 ? o(e + n, 0) : i(e, n)
    }
}, function(e, n, t) {
    var r = t(15);
    e.exports = function(e) {
        return Object(r(e))
    }
}, function(e, n, t) {
    var r = t(11);
    e.exports = function(e, n) {
        if (!r(e)) return e;
        var t, o;
        if (n && "function" == typeof(t = e.toString) && !r(o = t.call(e))) return o;
        if ("function" == typeof(t = e.valueOf) && !r(o = t.call(e))) return o;
        if (!n && "function" == typeof(t = e.toString) && !r(o = t.call(e))) return o;
        throw TypeError("Can't convert object to primitive value")
    }
}, function(e, n, t) {
    var r = t(23),
        o = t(0)("iterator"),
        i = t(6);
    e.exports = t(2).getIteratorMethod = function(e) {
        if (void 0 != e) return e[o] || e["@@iterator"] || i[r(e)]
    }
}, function(e, n, t) {
    "use strict";
    var r = t(43),
        o = t(54),
        i = t(6),
        a = t(21);
    e.exports = t(27)(Array, "Array", function(e, n) {
        this._t = a(e), this._i = 0, this._k = n
    }, function() {
        var e = this._t,
            n = this._k,
            t = this._i++;
        return !e || t >= e.length ? (this._t = void 0, o(1)) : "keys" == n ? o(0, t) : "values" == n ? o(0, e[t]) : o(0, [t, e[t]])
    }, "values"), i.Arguments = i.Array, r("keys"), r("values"), r("entries")
}, function(e, n, t) {
    var r = t(17);
    r(r.S + r.F * !t(4), "Object", {
        defineProperty: t(7).f
    })
}, function(e, n) {}, function(e, n, t) {
    "use strict";
    var r, o, i, a = t(28),
        u = t(1),
        s = t(9),
        c = t(23),
        l = t(17),
        f = t(11),
        p = t(14),
        d = t(44),
        h = t(46),
        v = t(64),
        g = t(31).set,
        m = t(55)(),
        y = u.TypeError,
        b = u.process,
        _ = u.Promise,
        b = u.process,
        x = "process" == c(b),
        E = function() {},
        w = !! function() {
            try {
                var e = _.resolve(1),
                    n = (e.constructor = {})[t(0)("species")] = function(e) {
                        e(E, E)
                    };
                return (x || "function" == typeof PromiseRejectionEvent) && e.then(E) instanceof n
            } catch (e) {}
        }(),
        R = function(e, n) {
            return e === n || e === _ && n === i
        },
        S = function(e) {
            var n;
            return !(!f(e) || "function" != typeof(n = e.then)) && n
        },
        T = function(e) {
            return R(_, e) ? new k(e) : new o(e)
        },
        k = o = function(e) {
            var n, t;
            this.promise = new e(function(e, r) {
                if (void 0 !== n || void 0 !== t) throw y("Bad Promise constructor");
                n = e, t = r
            }), this.resolve = p(n), this.reject = p(t)
        },
        A = function(e) {
            try {
                e()
            } catch (e) {
                return {
                    error: e
                }
            }
        },
        O = function(e, n) {
            if (!e._n) {
                e._n = !0;
                var t = e._c;
                m(function() {
                    for (var r = e._v, o = 1 == e._s, i = 0; t.length > i;) ! function(n) {
                        var t, i, a = o ? n.ok : n.fail,
                            u = n.resolve,
                            s = n.reject,
                            c = n.domain;
                        try {
                            a ? (o || (2 == e._h && I(e), e._h = 1), !0 === a ? t = r : (c && c.enter(), t = a(r), c && c.exit()), t === n.promise ? s(y("Promise-chain cycle")) : (i = S(t)) ? i.call(t, u, s) : u(t)) : s(r)
                        } catch (e) {
                            s(e)
                        }
                    }(t[i++]);
                    e._c = [], e._n = !1, n && !e._h && M(e)
                })
            }
        },
        M = function(e) {
            g.call(u, function() {
                var n, t, r, o = e._v;
                if (P(e) && (n = A(function() {
                        x ? b.emit("unhandledRejection", o, e) : (t = u.onunhandledrejection) ? t({
                            promise: e,
                            reason: o
                        }) : (r = u.console) && r.error && r.error("Unhandled promise rejection", o)
                    }), e._h = x || P(e) ? 2 : 1), e._a = void 0, n) throw n.error
            })
        },
        P = function(e) {
            if (1 == e._h) return !1;
            for (var n, t = e._a || e._c, r = 0; t.length > r;)
                if (n = t[r++], n.fail || !P(n.promise)) return !1;
            return !0
        },
        I = function(e) {
            g.call(u, function() {
                var n;
                x ? b.emit("rejectionHandled", e) : (n = u.onrejectionhandled) && n({
                    promise: e,
                    reason: e._v
                })
            })
        },
        L = function(e) {
            var n = this;
            n._d || (n._d = !0, n = n._w || n, n._v = e, n._s = 2, n._a || (n._a = n._c.slice()), O(n, !0))
        },
        N = function(e) {
            var n, t = this;
            if (!t._d) {
                t._d = !0, t = t._w || t;
                try {
                    if (t === e) throw y("Promise can't be resolved itself");
                    (n = S(e)) ? m(function() {
                        var r = {
                            _w: t,
                            _d: !1
                        };
                        try {
                            n.call(e, s(N, r, 1), s(L, r, 1))
                        } catch (e) {
                            L.call(r, e)
                        }
                    }): (t._v = e, t._s = 1, O(t, !1))
                } catch (e) {
                    L.call({
                        _w: t,
                        _d: !1
                    }, e)
                }
            }
        };
    w || (_ = function(e) {
        d(this, _, "Promise", "_h"), p(e), r.call(this);
        try {
            e(s(N, this, 1), s(L, this, 1))
        } catch (e) {
            L.call(this, e)
        }
    }, r = function(e) {
        this._c = [], this._a = void 0, this._s = 0, this._d = !1, this._v = void 0, this._h = 0, this._n = !1
    }, r.prototype = t(61)(_.prototype, {
        then: function(e, n) {
            var t = T(v(this, _));
            return t.ok = "function" != typeof e || e, t.fail = "function" == typeof n && n, t.domain = x ? b.domain : void 0, this._c.push(t), this._a && this._a.push(t), this._s && O(this, !1), t.promise
        },
        catch: function(e) {
            return this.then(void 0, e)
        }
    }), k = function() {
        var e = new r;
        this.promise = e, this.resolve = s(N, e, 1), this.reject = s(L, e, 1)
    }), l(l.G + l.W + l.F * !w, {
        Promise: _
    }), t(18)(_, "Promise"), t(63)("Promise"), i = t(2).Promise, l(l.S + l.F * !w, "Promise", {
        reject: function(e) {
            var n = T(this);
            return (0, n.reject)(e), n.promise
        }
    }), l(l.S + l.F * (a || !w), "Promise", {
        resolve: function(e) {
            if (e instanceof _ && R(e.constructor, this)) return e;
            var n = T(this);
            return (0, n.resolve)(e), n.promise
        }
    }), l(l.S + l.F * !(w && t(53)(function(e) {
        _.all(e).catch(E)
    })), "Promise", {
        all: function(e) {
            var n = this,
                t = T(n),
                r = t.resolve,
                o = t.reject,
                i = A(function() {
                    var t = [],
                        i = 0,
                        a = 1;
                    h(e, !1, function(e) {
                        var u = i++,
                            s = !1;
                        t.push(void 0), a++, n.resolve(e).then(function(e) {
                            s || (s = !0, t[u] = e, --a || r(t))
                        }, o)
                    }), --a || r(t)
                });
            return i && o(i.error), t.promise
        },
        race: function(e) {
            var n = this,
                t = T(n),
                r = t.reject,
                o = A(function() {
                    h(e, !1, function(e) {
                        n.resolve(e).then(t.resolve, r)
                    })
                });
            return o && r(o.error), t.promise
        }
    })
}, function(e, n, t) {
    "use strict";
    var r = t(65)(!0);
    t(27)(String, "String", function(e) {
        this._t = String(e), this._i = 0
    }, function() {
        var e, n = this._t,
            t = this._i;
        return t >= n.length ? {
            value: void 0,
            done: !0
        } : (e = r(n, t), this._i += e.length, {
            value: e,
            done: !1
        })
    })
}, function(e, n, t) {
    t(70);
    for (var r = t(1), o = t(5), i = t(6), a = t(0)("toStringTag"), u = ["NodeList", "DOMTokenList", "MediaList", "StyleSheetList", "CSSRuleList"], s = 0; s < 5; s++) {
        var c = u[s],
            l = r[c],
            f = l && l.prototype;
        f && !f[a] && o(f, a, c), i[c] = i.Array
    }
}, function(e, n, t) {
    n = e.exports = t(77)()
}, function(e, n) {
    e.exports = function() {
        var e = [];
        return e.toString = function() {
            for (var e = [], n = 0; n < this.length; n++) {
                var t = this[n];
                t[2] ? e.push("@media " + t[2] + "{" + t[1] + "}") : e.push(t[1])
            }
            return e.join("")
        }, e.i = function(n, t) {
            "string" == typeof n && (n = [
                [null, n, ""]
            ]);
            for (var r = {}, o = 0; o < this.length; o++) {
                var i = this[o][0];
                "number" == typeof i && (r[i] = !0)
            }
            for (o = 0; o < n.length; o++) {
                var a = n[o];
                "number" == typeof a[0] && r[a[0]] || (t && !a[2] ? a[2] = t : t && (a[2] = "(" + a[2] + ") and (" + t + ")"), e.push(a))
            }
        }, e
    }
}, function(e, n) {
    function t(e, n) {
        for (var t = 0; t < e.length; t++) {
            var r = e[t],
                o = p[r.id];
            if (o) {
                o.refs++;
                for (var i = 0; i < o.parts.length; i++) o.parts[i](r.parts[i]);
                for (; i < r.parts.length; i++) o.parts.push(s(r.parts[i], n))
            } else {
                for (var a = [], i = 0; i < r.parts.length; i++) a.push(s(r.parts[i], n));
                p[r.id] = {
                    id: r.id,
                    refs: 1,
                    parts: a
                }
            }
        }
    }

    function r(e) {
        for (var n = [], t = {}, r = 0; r < e.length; r++) {
            var o = e[r],
                i = o[0],
                a = o[1],
                u = o[2],
                s = o[3],
                c = {
                    css: a,
                    media: u,
                    sourceMap: s
                };
            t[i] ? t[i].parts.push(c) : n.push(t[i] = {
                id: i,
                parts: [c]
            })
        }
        return n
    }

    function o(e, n) {
        var t = v(),
            r = y[y.length - 1];
        if ("top" === e.insertAt) r ? r.nextSibling ? t.insertBefore(n, r.nextSibling) : t.appendChild(n) : t.insertBefore(n, t.firstChild), y.push(n);
        else {
            if ("bottom" !== e.insertAt) throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
            t.appendChild(n)
        }
    }

    function i(e) {
        e.parentNode.removeChild(e);
        var n = y.indexOf(e);
        n >= 0 && y.splice(n, 1)
    }

    function a(e) {
        var n = document.createElement("style");
        return n.type = "text/css", o(e, n), n
    }

    function u(e) {
        var n = document.createElement("link");
        return n.rel = "stylesheet", o(e, n), n
    }

    function s(e, n) {
        var t, r, o;
        if (n.singleton) {
            var s = m++;
            t = g || (g = a(n)), r = c.bind(null, t, s, !1), o = c.bind(null, t, s, !0)
        } else e.sourceMap && "function" == typeof URL && "function" == typeof URL.createObjectURL && "function" == typeof URL.revokeObjectURL && "function" == typeof Blob && "function" == typeof btoa ? (t = u(n), r = f.bind(null, t), o = function() {
            i(t), t.href && URL.revokeObjectURL(t.href)
        }) : (t = a(n), r = l.bind(null, t), o = function() {
            i(t)
        });
        return r(e),
            function(n) {
                if (n) {
                    if (n.css === e.css && n.media === e.media && n.sourceMap === e.sourceMap) return;
                    r(e = n)
                } else o()
            }
    }

    function c(e, n, t, r) {
        var o = t ? "" : r.css;
        if (e.styleSheet) e.styleSheet.cssText = b(n, o);
        else {
            var i = document.createTextNode(o),
                a = e.childNodes;
            a[n] && e.removeChild(a[n]), a.length ? e.insertBefore(i, a[n]) : e.appendChild(i)
        }
    }

    function l(e, n) {
        var t = n.css,
            r = n.media;
        if (r && e.setAttribute("media", r), e.styleSheet) e.styleSheet.cssText = t;
        else {
            for (; e.firstChild;) e.removeChild(e.firstChild);
            e.appendChild(document.createTextNode(t))
        }
    }

    function f(e, n) {
        var t = n.css,
            r = n.sourceMap;
        r && (t += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(r)))) + " */");
        var o = new Blob([t], {
                type: "text/css"
            }),
            i = e.href;
        e.href = URL.createObjectURL(o), i && URL.revokeObjectURL(i)
    }
    var p = {},
        d = function(e) {
            var n;
            return function() {
                return void 0 === n && (n = e.apply(this, arguments)), n
            }
        },
        h = d(function() {
            return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase())
        }),
        v = d(function() {
            return document.head || document.getElementsByTagName("head")[0]
        }),
        g = null,
        m = 0,
        y = [];
    e.exports = function(e, n) {
        if ("undefined" != typeof DEBUG && DEBUG && "object" != typeof document) throw new Error("The style-loader cannot be used in a non-browser environment");
        n = n || {}, void 0 === n.singleton && (n.singleton = h()), void 0 === n.insertAt && (n.insertAt = "bottom");
        var o = r(e);
        return t(o, n),
            function(e) {
                for (var i = [], a = 0; a < o.length; a++) {
                    var u = o[a],
                        s = p[u.id];
                    s.refs--, i.push(s)
                }
                if (e) {
                    t(r(e), n)
                }
                for (var a = 0; a < i.length; a++) {
                    var s = i[a];
                    if (0 === s.refs) {
                        for (var c = 0; c < s.parts.length; c++) s.parts[c]();
                        delete p[s.id]
                    }
                }
            }
    };
    var b = function() {
        var e = [];
        return function(n, t) {
            return e[n] = t, e.filter(Boolean).join("\n")
        }
    }()
}, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
        value: !0
    });
    var r = t(34),
        o = t(22);
    t(35);
    var i = new o.a;
    new r.a(i).bindEventHandlers();
}]);

} catch(e) {
  console.error(e);
  var userId;
  if (window.localStorage) {
    userId = window.localStorage.getItem('eyelevel.user.userId');
  }
  if (typeof gtag !== 'undefined') {
    gtag('event', window.location.hostname, { event_category: 'chat_agent_error', event_label: (e && e.stack) ? e.stack : e, uid: userId, username: window.username, flowname: window.flowname, origin: window.origin, shouldOpen: window.shouldOpen });
  }
}


var XLSX_SVG = `<svg width="44" height="54" viewBox="0 0 44 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.12336 53.6606H3.44336V0.340576H6.12336V53.6606Z" fill="#D1D8DE" />
      <path d="M35.2023 53.6606H5.40234V0.340576H43.1223V45.7606L35.2023 53.6606Z" fill="#EFF2F4" />
      <path d="M0.882812 21.6205V6.04053L3.44281 8.56053V24.1605L0.882812 21.6205Z" fill="#00692D" />
      <path d="M35.2031 45.7605H43.1231L35.2031 53.6605V45.7605Z" fill="#D1D8DE" />
      <path d="M0.882812 21.6205V6.04053H32.3428V21.6205H0.882812Z" fill="#007934" />
      <path
        d="M4.42383 17.3206L6.62383 13.7606L4.42383 10.3406H6.08383L7.50383 12.7806L8.92383 10.3406H10.6038L8.40383 13.7606L10.6038 17.3406H8.94383L7.52383 14.9206L6.10383 17.3406H4.44383L4.42383 17.3206ZM11.2838 17.3206V10.3206H12.7238V16.0206H16.1438V17.3206H11.2838ZM16.6038 15.1606H18.0238C18.0838 15.5406 18.2438 15.8206 18.4838 16.0206C18.7438 16.2006 19.1238 16.3006 19.6038 16.3006C20.0238 16.3006 20.3438 16.2206 20.5438 16.0806C20.7638 15.9406 20.8638 15.7206 20.8638 15.4206C20.8638 15.0006 20.2638 14.6406 19.0438 14.3606H19.0038C18.9638 14.3606 18.9238 14.3406 18.8638 14.3206C18.2038 14.1806 17.7438 14.0206 17.4638 13.8406C17.2238 13.6806 17.0238 13.4606 16.9038 13.2006C16.7838 12.9406 16.7038 12.6206 16.7038 12.2606C16.7038 11.5806 16.9438 11.0606 17.4038 10.7006C17.8638 10.3406 18.5238 10.1606 19.4038 10.1606C20.2238 10.1606 20.8638 10.3606 21.3238 10.7406C21.7838 11.1206 22.0238 11.6806 22.0438 12.3806H20.6638C20.6438 12.0406 20.5038 11.7806 20.2838 11.6006C20.0438 11.4206 19.7238 11.3406 19.2838 11.3406C18.9038 11.3406 18.6238 11.4206 18.4038 11.5606C18.2038 11.7006 18.1038 11.9206 18.1038 12.1806C18.1038 12.5606 18.5038 12.8206 19.3038 13.0206C19.5238 13.0806 19.6838 13.1006 19.8038 13.1406C20.3038 13.2606 20.6838 13.3806 20.8838 13.4406C21.1038 13.5206 21.2838 13.6006 21.4438 13.6806C21.7238 13.8406 21.9438 14.0406 22.0838 14.3006C22.2238 14.5606 22.3038 14.8806 22.3038 15.2406C22.3038 15.9606 22.0638 16.5406 21.5638 16.9406C21.0638 17.3406 20.3838 17.5406 19.4838 17.5406C18.6038 17.5406 17.9038 17.3406 17.4238 16.9206C16.9238 16.5206 16.6638 15.9406 16.6238 15.1806L16.6038 15.1606ZM22.6438 17.3206L24.8438 13.7606L22.6438 10.3406H24.3038L25.7238 12.7806L27.1438 10.3406H28.8238L26.6238 13.7606L28.8238 17.3406H27.1638L25.7438 14.9206L24.3238 17.3406H22.6638L22.6438 17.3206Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M28.2009 34.9404H25.2409L24.5809 35.7604L23.9209 34.9404H20.9609L23.1009 37.6004L20.9609 40.2604H28.1809L26.0409 37.6004L28.1809 34.9404H28.2009ZM22.2409 35.3204H21.8209L25.4809 39.9004H25.9009L22.2409 35.3204Z"
        fill="#007934"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.7619 33.6203V41.6603L31.0019 43.8803V31.4003L17.7619 33.6203ZM16.4219 32.5003L32.3219 29.8403V45.4803L16.4219 42.8203V32.5203V32.5003Z"
        fill="#007934"
      />
    </svg>`;

var TXT_SVG = `<svg width="44" height="54" viewBox="0 0 44 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.12336 53.6603H3.44336V0.340332H6.12336V53.6603Z" fill="#D1D8DE" />
      <path d="M35.2023 53.6603H5.40234V0.340332H43.1223V45.7603L35.2023 53.6603Z" fill="#EFF2F4" />
      <path d="M0.882812 21.6203V6.04028L3.44281 8.56028V24.1603L0.882812 21.6203Z" fill="#004478" />
      <path d="M35.2031 45.7603H43.1231L35.2031 53.6603V45.7603Z" fill="#CFD8DF" />
      <path d="M0.882812 21.6203V6.04028H28.9828V21.6203H0.882812Z" fill="#01579B" />
      <path
        d="M8.34367 17.3203V11.5803H6.26367V10.3403H11.8437V11.5803H9.78367V17.3203H8.34367ZM11.9037 17.3203L14.1037 13.7603L11.9037 10.3403H13.5637L14.9837 12.7803L16.4037 10.3403H18.0837L15.8837 13.7603L18.0837 17.3403H16.4237L15.0037 14.9203L13.5837 17.3403H11.9237L11.9037 17.3203ZM20.2037 17.3203V11.5803H18.1237V10.3403H23.7037V11.5803H21.6437V17.3203H20.2037Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.4414 43.5803H23.1414V45.3803H16.4414V43.5803Z"
        fill="#004478"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.4414 40.1404H30.9814V41.9404H16.4414V40.1404Z"
        fill="#004478"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.4414 36.7202H32.3414V38.5002H16.4414V36.7202Z"
        fill="#004478"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.4414 33.2803H27.5614V35.0603H16.4414V33.2803Z"
        fill="#004478"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.4414 29.8403H32.3414V31.6203H16.4414V29.8403Z"
        fill="#004478"
      />
    </svg>`;

var PPTX_SVG = `<svg width="44" height="54" viewBox="0 0 44 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.12336 53.6603H3.44336V0.340332H6.12336V53.6603Z" fill="#D1D8DE" />
      <path d="M35.2023 53.6603H5.40234V0.340332H43.1223V45.7603L35.2023 53.6603Z" fill="#EFF2F4" />
      <path d="M0.882812 21.6203V6.04028L3.44281 8.56028V24.1603L0.882812 21.6203Z" fill="#F05609" />
      <path d="M35.2031 45.7603H43.1231L35.2031 53.6603V45.7603Z" fill="#D1D8DE" />
      <path d="M0.882812 21.6203V6.04028H28.9828V21.6203H0.882812Z" fill="#FF671B" />
      <path
        d="M7.06201 14.7192H5.43164V13.6909H7.06201C7.31396 13.6909 7.51904 13.6499 7.67725 13.5679C7.83545 13.4829 7.95117 13.3657 8.02441 13.2163C8.09766 13.0669 8.13428 12.8984 8.13428 12.7109C8.13428 12.5205 8.09766 12.3433 8.02441 12.1792C7.95117 12.0151 7.83545 11.8833 7.67725 11.7837C7.51904 11.6841 7.31396 11.6343 7.06201 11.6343H5.88867V17H4.57031V10.6016H7.06201C7.56299 10.6016 7.99219 10.6924 8.34961 10.874C8.70996 11.0527 8.98535 11.3003 9.17578 11.6167C9.36621 11.9331 9.46143 12.2949 9.46143 12.7021C9.46143 13.1152 9.36621 13.4727 9.17578 13.7744C8.98535 14.0762 8.70996 14.3091 8.34961 14.4731C7.99219 14.6372 7.56299 14.7192 7.06201 14.7192Z"
        fill="white"
      />
      <path
        d="M12.8628 14.7192H11.2324V13.6909H12.8628C13.1147 13.6909 13.3198 13.6499 13.478 13.5679C13.6362 13.4829 13.752 13.3657 13.8252 13.2163C13.8984 13.0669 13.9351 12.8984 13.9351 12.7109C13.9351 12.5205 13.8984 12.3433 13.8252 12.1792C13.752 12.0151 13.6362 11.8833 13.478 11.7837C13.3198 11.6841 13.1147 11.6343 12.8628 11.6343H11.6895V17H10.3711V10.6016H12.8628C13.3638 10.6016 13.793 10.6924 14.1504 10.874C14.5107 11.0527 14.7861 11.3003 14.9766 11.6167C15.167 11.9331 15.2622 12.2949 15.2622 12.7021C15.2622 13.1152 15.167 13.4727 14.9766 13.7744C14.7861 14.0762 14.5107 14.3091 14.1504 14.4731C13.793 14.6372 13.3638 14.7192 12.8628 14.7192Z"
        fill="white"
      />
      <path
        d="M19.0327 10.6016V17H17.7188V10.6016H19.0327ZM21.0015 10.6016V11.6343H15.7808V10.6016H21.0015Z"
        fill="white"
      />
      <path
        d="M22.8384 10.6016L24.0425 12.834L25.2466 10.6016H26.7539L24.895 13.7744L26.8022 17H25.2817L24.0425 14.7236L22.8032 17H21.2739L23.1855 13.7744L21.3223 10.6016H22.8384Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.4414 29.8203H32.3414V45.3803H16.4414V29.8203Z"
        fill="#FF671B"
      />
      <path fillRule="evenodd" clipRule="evenodd" d="M17.8223 31.1604H30.9623V44.0204H17.8223V31.1604Z" fill="white" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.7207 33.7603H29.0607V41.4203H19.7207V33.7603Z"
        fill="#FF671B"
      />
      <path fillRule="evenodd" clipRule="evenodd" d="M20.4199 34.5603H28.3599V35.5603H20.4199V34.5603Z" fill="white" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22.3999 36.4004C21.2999 36.4004 20.4199 37.2604 20.4199 38.3404C20.4199 39.4204 21.2999 40.2804 22.3999 40.2804C23.4999 40.2804 24.3799 39.4204 24.3799 38.3404H22.3999V36.4004Z"
        fill="white"
      />
      <path fillRule="evenodd" clipRule="evenodd" d="M25.3203 36.5403H28.3603V37.1203H25.3203V36.5403Z" fill="white" />
      <path fillRule="evenodd" clipRule="evenodd" d="M25.3203 37.7603H28.3603V38.3403H25.3203V37.7603Z" fill="white" />
      <path fillRule="evenodd" clipRule="evenodd" d="M25.3203 39.0002H28.3603V39.5602H25.3203V39.0002Z" fill="white" />
    </svg>`;

var JSON_SVG = `<svg width="44" height="54" viewBox="0 0 44 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.12336 53.6603H3.44336V0.340332H6.12336V53.6603Z" fill="#D1D8DE" />
      <path d="M34.8 53.6603H5V0.340332H42.72V45.7603L34.8 53.6603Z" fill="#EFF2F4" />
      <path d="M0.882812 21.6205V6.04053L3.44281 8.56053V24.1605L0.882812 21.6205Z" fill="#6F587C" />
      <path d="M35.2031 45.7603H43.1231L35.2031 53.6603V45.7603Z" fill="#CFD8DF" />
      <path d="M1 22V6H36V22H1Z" fill="#9B73B0" />
      <path
        d="M30.09 10.124V17.0001H28.9821L25.7421 12.3164H25.6851V17.0001H24.4395V10.124H25.5541L28.7907 14.811H28.8511V10.124H30.09Z"
        fill="white"
      />
      <path
        d="M23.2621 13.5618C23.2621 14.3027 23.1233 14.9372 22.8457 15.4655C22.5704 15.9915 22.1944 16.3944 21.7176 16.6742C21.2431 16.9539 20.7048 17.0938 20.1027 17.0938C19.5006 17.0938 18.9612 16.9539 18.4844 16.6742C18.0099 16.3921 17.6339 15.9881 17.3563 15.4621C17.081 14.9339 16.9434 14.3004 16.9434 13.5618C16.9434 12.8209 17.081 12.1875 17.3563 11.6615C17.6339 11.1333 18.0099 10.7293 18.4844 10.4495C18.9612 10.1697 19.5006 10.0298 20.1027 10.0298C20.7048 10.0298 21.2431 10.1697 21.7176 10.4495C22.1944 10.7293 22.5704 11.1333 22.8457 11.6615C23.1233 12.1875 23.2621 12.8209 23.2621 13.5618ZM22.0097 13.5618C22.0097 13.0403 21.928 12.6005 21.7646 12.2423C21.6035 11.882 21.3797 11.61 21.0932 11.4265C20.8067 11.2407 20.4765 11.1478 20.1027 11.1478C19.7289 11.1478 19.3988 11.2407 19.1123 11.4265C18.8258 11.61 18.6008 11.882 18.4374 12.2423C18.2763 12.6005 18.1957 13.0403 18.1957 13.5618C18.1957 14.0833 18.2763 14.5243 18.4374 14.8846C18.6008 15.2428 18.8258 15.5147 19.1123 15.7005C19.3988 15.884 19.7289 15.9758 20.1027 15.9758C20.4765 15.9758 20.8067 15.884 21.0932 15.7005C21.3797 15.5147 21.6035 15.2428 21.7646 14.8846C21.928 14.5243 22.0097 14.0833 22.0097 13.5618Z"
        fill="white"
      />
      <path
        d="M14.7157 12.014C14.6844 11.7208 14.5524 11.4925 14.3196 11.3291C14.089 11.1657 13.7891 11.084 13.4198 11.084C13.1601 11.084 12.9374 11.1232 12.7516 11.2015C12.5659 11.2799 12.4237 11.3862 12.3253 11.5205C12.2268 11.6548 12.1764 11.8081 12.1742 11.9805C12.1742 12.1237 12.2066 12.2479 12.2715 12.3531C12.3387 12.4583 12.4293 12.5479 12.5435 12.6217C12.6576 12.6934 12.7841 12.7538 12.9229 12.803C13.0617 12.8523 13.2015 12.8937 13.3426 12.9273L13.9872 13.0884C14.2468 13.1488 14.4964 13.2305 14.7359 13.3335C14.9776 13.4365 15.1936 13.5663 15.3839 13.723C15.5764 13.8796 15.7286 14.0688 15.8405 14.2904C15.9524 14.512 16.0084 14.7716 16.0084 15.0693C16.0084 15.4722 15.9054 15.827 15.6995 16.1336C15.4936 16.438 15.1959 16.6764 14.8064 16.8487C14.4192 17.0189 13.9503 17.1039 13.3996 17.1039C12.8647 17.1039 12.4002 17.0211 12.0063 16.8555C11.6146 16.6898 11.3079 16.4481 11.0864 16.1303C10.867 15.8124 10.7484 15.4252 10.7305 14.9686H11.9559C11.9738 15.2081 12.0477 15.4073 12.1775 15.5662C12.3073 15.7251 12.4763 15.8437 12.6845 15.9221C12.8949 16.0004 13.1299 16.0396 13.3896 16.0396C13.6604 16.0396 13.8977 15.9993 14.1013 15.9187C14.3073 15.8359 14.4684 15.7218 14.5848 15.5763C14.7012 15.4285 14.7605 15.2562 14.7628 15.0592C14.7605 14.8802 14.7079 14.7324 14.605 14.616C14.502 14.4974 14.3576 14.3989 14.1718 14.3206C13.9883 14.24 13.7734 14.1684 13.5272 14.1057L12.7449 13.9043C12.1786 13.7588 11.731 13.5383 11.402 13.2429C11.0752 12.9452 10.9118 12.5501 10.9118 12.0577C10.9118 11.6525 11.0214 11.2978 11.2408 10.9934C11.4624 10.689 11.7634 10.4528 12.144 10.285C12.5245 10.1148 12.9553 10.0298 13.4366 10.0298C13.9245 10.0298 14.352 10.1148 14.7191 10.285C15.0884 10.4528 15.3783 10.6867 15.5887 10.9867C15.7991 11.2843 15.9076 11.6268 15.9144 12.014H14.7157Z"
        fill="white"
      />
      <path
        d="M8.39109 10.124H9.62663V14.9587C9.62439 15.4019 9.53038 15.7835 9.34461 16.1036C9.15883 16.4215 8.89919 16.6666 8.56568 16.8389C8.23441 17.009 7.84831 17.0941 7.40736 17.0941C7.00447 17.0941 6.64187 17.0224 6.31955 16.8792C5.99948 16.7337 5.74543 16.5188 5.55742 16.2346C5.3694 15.9503 5.27539 15.5966 5.27539 15.1736H6.51429C6.51652 15.3594 6.55681 15.5194 6.63515 15.6537C6.71573 15.788 6.82653 15.891 6.96754 15.9626C7.10855 16.0342 7.27083 16.07 7.45437 16.07C7.65358 16.07 7.82257 16.0286 7.96134 15.9458C8.10012 15.8608 8.20532 15.7354 8.27694 15.5698C8.3508 15.4042 8.38885 15.2005 8.39109 14.9587V10.124Z"
        fill="white"
      />
      <path
        d="M17.75 34.25V31.25C17.75 30.8368 18.086 30.5 18.5 30.5C18.9148 30.5 19.25 30.164 19.25 29.75C19.25 29.336 18.9148 29 18.5 29C17.2595 29 16.25 30.0095 16.25 31.25V34.25C16.25 35.0773 15.5773 35.75 14.75 35.75C14.3353 35.75 14 36.086 14 36.5C14 36.914 14.3353 37.25 14.75 37.25C15.5773 37.25 16.25 37.9227 16.25 38.75V41.75C16.25 42.9905 17.2595 44 18.5 44C18.9148 44 19.25 43.664 19.25 43.25C19.25 42.836 18.9148 42.5 18.5 42.5C18.086 42.5 17.75 42.1632 17.75 41.75V38.75C17.75 37.85 17.3435 37.0505 16.7135 36.5C17.3435 35.9495 17.75 35.15 17.75 34.25Z"
        fill="#9777A8"
      />
      <path
        d="M23.75 35C24.3713 35 24.875 34.4963 24.875 33.875C24.875 33.2537 24.3713 32.75 23.75 32.75C23.1287 32.75 22.625 33.2537 22.625 33.875C22.625 34.4963 23.1287 35 23.75 35Z"
        fill="#9777A8"
      />
      <path
        d="M32.75 35.75C31.9227 35.75 31.25 35.0773 31.25 34.25V31.25C31.25 30.0095 30.2405 29 29 29C28.5853 29 28.25 29.336 28.25 29.75C28.25 30.164 28.5853 30.5 29 30.5C29.414 30.5 29.75 30.8368 29.75 31.25V34.25C29.75 35.15 30.1565 35.9495 30.7865 36.5C30.1565 37.0505 29.75 37.85 29.75 38.75V41.75C29.75 42.1632 29.414 42.5 29 42.5C28.5853 42.5 28.25 42.836 28.25 43.25C28.25 43.664 28.5853 44 29 44C30.2405 44 31.25 42.9905 31.25 41.75V38.75C31.25 37.9227 31.9227 37.25 32.75 37.25C33.1648 37.25 33.5 36.914 33.5 36.5C33.5 36.086 33.1648 35.75 32.75 35.75Z"
        fill="#9777A8"
      />
      <path
        d="M23.75 38C23.3353 38 23 38.336 23 38.75V41C23 41.414 23.3353 41.75 23.75 41.75C24.1647 41.75 24.5 41.414 24.5 41V38.75C24.5 38.336 24.1647 38 23.75 38Z"
        fill="#9777A8"
      />
    </svg>`;

var DOCX_SVG = `<svg width="44" height="54" viewBox="0 0 44 54" xmlns="http://www.w3.org/2000/svg" fill="none">
      <path d="M6.12336 53.6603H3.44336V0.340332H6.12336V53.6603Z" fill="#D1D8DE" />
      <path d="M35.2023 53.6603H5.40234V0.340332H43.1223V45.7603L35.2023 53.6603Z" fill="#EFF2F4" />
      <path d="M0.882812 21.6203V6.04028L3.44281 8.56028V24.1603L0.882812 21.6203Z" fill="#1E4387" />
      <path d="M35.2031 45.7603H43.1231L35.2031 53.6603V45.7603Z" fill="#D1D8DE" />
      <path d="M0.882812 21.6203V6.04028H32.3028V21.6203H0.882812Z" fill="#2654A9" />
      <path
        d="M6.42203 15.9203H7.50203C8.12203 15.9203 8.58203 15.7603 8.86203 15.4203C9.14203 15.1003 9.28203 14.5603 9.28203 13.8203C9.28203 13.0803 9.14203 12.5403 8.88203 12.2003C8.62203 11.8603 8.20203 11.6803 7.64203 11.6803H6.38203V15.9203H6.42203ZM5.10203 17.1203V10.5203H7.68203C8.70203 10.5203 9.44203 10.8003 9.94203 11.3403C10.442 11.8803 10.682 12.7203 10.682 13.8203C10.682 14.4203 10.582 14.9603 10.402 15.4203C10.222 15.8803 9.94203 16.2403 9.60203 16.5203C9.34203 16.7203 9.04203 16.8803 8.70203 16.9803C8.36203 17.0803 7.90203 17.1203 7.30203 17.1203H5.08203H5.10203ZM12.162 13.8203C12.162 14.5403 12.322 15.1003 12.642 15.5203C12.962 15.9203 13.422 16.1203 14.002 16.1203C14.582 16.1203 15.042 15.9203 15.362 15.5203C15.682 15.1203 15.842 14.5603 15.842 13.8203C15.842 13.1003 15.682 12.5403 15.362 12.1403C15.042 11.7403 14.582 11.5403 14.002 11.5403C13.422 11.5403 12.982 11.7403 12.642 12.1403C12.322 12.5403 12.162 13.1003 12.162 13.8403V13.8203ZM10.782 13.8203C10.782 12.7603 11.082 11.9203 11.662 11.2803C12.242 10.6603 13.022 10.3403 14.002 10.3403C14.982 10.3403 15.762 10.6603 16.362 11.2803C16.942 11.9003 17.242 12.7603 17.242 13.8203C17.242 14.8803 16.942 15.7203 16.362 16.3603C15.782 16.9803 15.002 17.3003 14.002 17.3003C13.022 17.3003 12.242 16.9803 11.662 16.3603C11.082 15.7403 10.782 14.8803 10.782 13.8203ZM23.322 14.8403C23.262 15.5803 22.982 16.1803 22.462 16.6203C21.942 17.0603 21.242 17.2803 20.402 17.2803C19.422 17.2803 18.662 16.9803 18.122 16.3603C17.582 15.7603 17.302 14.9003 17.302 13.8003C17.302 12.6803 17.582 11.8203 18.122 11.2203C18.682 10.6203 19.462 10.3203 20.502 10.3203C21.342 10.3203 22.002 10.5203 22.502 10.9403C22.982 11.3403 23.262 11.9403 23.302 12.6803H21.962C21.902 12.3003 21.762 12.0203 21.502 11.8203C21.262 11.6203 20.922 11.5203 20.502 11.5203C19.902 11.5203 19.442 11.7203 19.142 12.1003C18.822 12.4803 18.682 13.0403 18.682 13.7803C18.682 14.5003 18.842 15.0403 19.142 15.4403C19.462 15.8403 19.882 16.0203 20.462 16.0203C20.882 16.0203 21.202 15.9203 21.482 15.7003C21.742 15.4803 21.922 15.1803 22.002 14.8003H23.322V14.8403ZM22.962 17.1003L25.042 13.7403L22.962 10.5203H24.522L25.862 12.8203L27.202 10.5203H28.782L26.702 13.7403L28.782 17.1203H27.222L25.882 14.8403L24.542 17.1203H22.982L22.962 17.1003Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.7619 33.6201V41.6601L31.0019 43.8801V31.4001L17.7619 33.6201ZM16.4219 32.5001L32.3219 29.8401V45.4801L16.4219 42.8201V32.5201V32.5001Z"
        fill="#2654A9"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22.0413 39.3803L22.1813 39.0003L22.5213 38.1403L23.7613 35.3003H25.0013V38.2203C25.0013 38.6003 24.9613 39.0003 24.9013 39.3803C24.9213 39.3203 25.0813 38.8803 25.4013 38.1003L26.5213 35.2803H27.9413L25.6013 40.6803H23.9013V38.4003C23.9013 38.0203 23.9213 37.6203 23.9413 37.2003C23.8613 37.5203 23.7213 37.9603 23.5013 38.4803L22.5613 40.6803H20.9613L20.7812 35.2803H22.1413L22.1013 37.9803C22.0813 38.6403 22.0613 39.1003 22.0013 39.3603L22.0413 39.3803Z"
        fill="#2654A9"
      />
    </svg>`;

var CSV_SVG = `<svg width="44" height="54" viewBox="0 0 44 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.12336 53.6603H3.44336L3.44336 0.340332L6.12336 0.340332L6.12336 53.6603Z" fill="#D1D8DE" />
      <path d="M35.2023 53.6603H5.40234L5.40234 0.340332L43.1223 0.340332V45.7603L35.2023 53.6603Z" fill="#EFF2F4" />
      <path d="M0.882813 21.6203L0.882812 6.04028L3.44281 8.56028L3.44281 24.1603L0.882813 21.6203Z" fill="#0287D4" />
      <path d="M35.2031 45.7603H43.1231L35.2031 53.6603V45.7603Z" fill="#CFD8DF" />
      <path d="M0.882813 21.6203L0.882812 6.04028L28.9828 6.04028V21.6203H0.882813Z" fill="#009AF3" />
      <path
        d="M11.7218 14.9204C11.6618 15.7204 11.3618 16.3404 10.8018 16.8204C10.2418 17.2804 9.5218 17.5204 8.6218 17.5204C7.5818 17.5204 6.7818 17.2004 6.2018 16.5604C5.6218 15.9204 5.3418 15.0004 5.3418 13.8404C5.3418 12.6604 5.6418 11.7404 6.2218 11.1004C6.8018 10.4604 7.6418 10.1604 8.7418 10.1604C9.6418 10.1604 10.3418 10.3804 10.8618 10.8204C11.3818 11.2604 11.6618 11.8804 11.7218 12.6604H10.3018C10.2418 12.2604 10.0818 11.9604 9.8218 11.7604C9.5618 11.5604 9.2018 11.4404 8.7618 11.4404C8.1218 11.4404 7.6418 11.6404 7.3218 12.0604C7.0018 12.4604 6.8218 13.0604 6.8218 13.8404C6.8218 14.6004 6.9818 15.1804 7.3218 15.6004C7.6418 16.0204 8.1218 16.2204 8.7218 16.2204C9.1618 16.2204 9.5218 16.1004 9.8018 15.8804C10.0818 15.6604 10.2618 15.3404 10.3418 14.9204H11.7418H11.7218ZM12.7218 15.1604H14.1418C14.2018 15.5404 14.3618 15.8204 14.6018 16.0204C14.8618 16.2004 15.2418 16.3004 15.7218 16.3004C16.1418 16.3004 16.4618 16.2204 16.6618 16.0804C16.8818 15.9404 16.9818 15.7204 16.9818 15.4204C16.9818 15.0004 16.3818 14.6404 15.1618 14.3604H15.1218C15.0818 14.3604 15.0418 14.3404 14.9818 14.3204C14.3218 14.1804 13.8618 14.0204 13.5818 13.8404C13.3418 13.6804 13.1418 13.4604 13.0218 13.2004C12.9018 12.9404 12.8218 12.6204 12.8218 12.2604C12.8218 11.5804 13.0618 11.0604 13.5218 10.7004C13.9818 10.3404 14.6418 10.1604 15.5218 10.1604C16.3418 10.1604 16.9818 10.3604 17.4418 10.7404C17.9018 11.1204 18.1418 11.6804 18.1618 12.3804H16.7818C16.7618 12.0404 16.6218 11.7804 16.4018 11.6004C16.1618 11.4204 15.8418 11.3404 15.4018 11.3404C15.0218 11.3404 14.7418 11.4204 14.5218 11.5604C14.3218 11.7004 14.2218 11.9204 14.2218 12.1804C14.2218 12.5604 14.6218 12.8204 15.4218 13.0204C15.6418 13.0804 15.8018 13.1004 15.9218 13.1404C16.4218 13.2604 16.8018 13.3804 17.0018 13.4404C17.2218 13.5204 17.4018 13.6004 17.5618 13.6804C17.8418 13.8404 18.0618 14.0404 18.2018 14.3004C18.3418 14.5604 18.4218 14.8804 18.4218 15.2404C18.4218 15.9604 18.1818 16.5404 17.6818 16.9404C17.1818 17.3404 16.5018 17.5404 15.6018 17.5404C14.7218 17.5404 14.0218 17.3404 13.5418 16.9204C13.0418 16.5204 12.7818 15.9404 12.7418 15.1804L12.7218 15.1604ZM21.1618 17.3204L18.7418 10.3204H20.3418L21.8218 15.5604L23.3418 10.3204H24.9218L22.5418 17.3204H21.1618Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22.2019 29.8401H16.4219V39.6601V41.2601V45.4001H32.3419V41.2601V39.6601V31.9201H22.2019V29.8401ZM17.3819 41.2601H21.2419V42.3001H17.3819V41.2601ZM22.2019 41.2601H31.3819V42.3001H22.2019V41.2601ZM31.3819 40.2201H22.2019V39.6601V39.2001H31.3819V39.6601V40.2201ZM21.2419 40.2201H17.3819V39.6601V39.2001H21.2419V39.6601V40.2201ZM21.2419 44.3801H17.3819V43.3401H21.2419V44.3801ZM31.3819 44.3801H22.2019V43.3401H31.3819V44.3801ZM17.3819 32.9601H21.2419V34.0001H17.3819V32.9601ZM17.3819 35.0401H21.2419V36.0801H17.3819V35.0401ZM17.3819 37.1201H21.2419V38.1601H17.3819V37.1201ZM31.3819 38.1601H22.2019V37.1201H31.3819V38.1601ZM31.3819 36.0801H22.2019V35.0401H31.3819V36.0801ZM31.3819 32.9601V34.0001H22.2019V32.9601H31.3819ZM17.3819 31.9201V30.8801H21.2419V31.9201H17.3819Z"
        fill="#00897B"
      />
    </svg>`;

var MAP_FILE_TYPE_TO_SVG = {
  xlsx: XLSX_SVG,
  txt: TXT_SVG,
  ppts: PPTX_SVG,
  json: JSON_SVG,
  docx: DOCX_SVG,
  csv: CSV_SVG,
};

$(document).ready(function (e) {
    ///////////////////////////////////////////////////
    const REQUEST = 'txtRequest';
    const RESPONSE = 'txtResponse';
    const LOG = 'txtLog';
    const SPLIT_RESPONSE = '################################';

    ///////////////////////////////////////////////////
    const socket = io();
    socket.on('connect', function () {
        socket.on('log', function (log) {
            $('.' + LOG).val($('.' + LOG).val() + "\n" + log);
        })
        socket.on('post', function (body) {
            $('.' + REQUEST).val($('.' + REQUEST).val() + "\n" + body);
        });
    });

    $('.btnFormat').click(function (event) {
        let boxActive = $(this).attr('box');
        formatJson(boxActive);
    })

    $('.btnEscape').click(function (event) {
        let boxActive = $(this).attr('box');
        escapeJson(boxActive);
    });

    $('.btnUnescape').click(function (event) {
        let boxActive = $(this).attr('box');
        unEscapeJson(boxActive);
    });

    $('.btnClear').click(function(event) {
        let boxActive = $(this).attr('box');
        clearBox(boxActive);
    });

    $('.btnResponse').click(function (event) {
        var valueResponses = $('.' + RESPONSE).val();
        var bodyTrimItems = [];
        let bodyItems = valueResponses.split(SPLIT_RESPONSE);        
        bodyItems.forEach(bodyItem => {
            bodyItem = bodyItem.trim();
            if (bodyItem !== "") {
                bodyTrimItems.push(bodyItem);
            }
        });
        socket.emit('response', bodyTrimItems);
    });

    function formatJson(boxClazz) {
        let txt = $('.' + boxClazz).val();
        let json = JSON.stringify(JSON.parse(txt), null, 2);
        $('.' + boxClazz).val(json);
        return json;
    }

    function escapeJson(boxClazz) {
        let txt = $('.' + boxClazz).val();
        let json = JSON.stringify(txt);
        $('.' + boxClazz).val(json);
        return json;
    }

    function unEscapeJson(boxClazz) {
        let txt = $('.' + boxClazz).val();
        let json = JSON.parse(txt);
        $('.' + boxClazz).val(json);
        return json;
    }

    function clearBox(boxClazz) {
        $('.' + boxClazz).val('');
    }

    //////////////////////// Drop file ///////////////////////////
    function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer.files;
        var arrayFiles = [];
        for(idx = 0; idx < files.length; idx++) {
            arrayFiles.push(files[idx]);
        }
        arrayFiles.sort((a, b) => a.name.localeCompare(b.name));
        loadFileIndex(arrayFiles, 0);
    }

    function loadFileIndex(files, idx) {
        var reader = new FileReader();
        reader.readAsText(files[idx], "UTF-8");
        var valueAppend = document.getElementById('txtResponse').value;
        reader.onload = function (event) {
            if (valueAppend !== "") 
            {
                valueAppend = valueAppend + "\n";   
            }
            valueAppend = valueAppend + SPLIT_RESPONSE + "\n" + event.target.result;
        }
        reader.onloadend = function(event) {
            document.getElementById('txtResponse').value = valueAppend;
            if (idx < files.length - 1) {
                loadFileIndex(files, ++idx);
            }
        }
    }

    function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    // Setup the dnd listeners.
    var dropZone = document.getElementById('txtResponse');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);

    //////////////////////// Drop file ///////////////////////////
    function saveTextAsFile() {
        var textToWrite = document.getElementById('txtResponse').value;
        var textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' });
        var fileNameToSaveAs = document.getElementById('txtName').value;

        var downloadLink = document.createElement("a");
        downloadLink.download = fileNameToSaveAs;
        downloadLink.innerHTML = "Download File";
        if (window.webkitURL != null) {
            // Chrome allows the link to be clicked
            // without actually adding it to the DOM.
            downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
        }
        else {
            // Firefox requires the link to be added to the DOM
            // before it can be clicked.
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            downloadLink.onclick = destroyClickedElement;
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
        }

        downloadLink.click();
    }

    var button = document.getElementById('btnSave');
    button.addEventListener('click', saveTextAsFile);
});
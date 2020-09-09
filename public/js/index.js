$(document).ready(function (e) {
    ///////////////////////////////////////////////////
    const REQUEST = 'txtRequest';
    const RESPONSE = 'txtResponse';

    ///////////////////////////////////////////////////
    const socket = io();
    socket.on('connect', function () {
        socket.on('post', function (body) {
            $('.' + REQUEST).val(JSON.stringify(JSON.parse(body),null,2));
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

    $('.btnResponse').click(function (event) {
        socket.emit('response', $('.' + RESPONSE).val());
    });

    function formatJson(boxClazz) {
        let txt = $('.' + boxClazz).val();
        let json = JSON.stringify(JSON.parse(txt),null,2);
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
});
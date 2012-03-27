(function() {
    $("#timerButton").click(function(){
        if ($(this).hasClass("btn-primary")) {
            $(this).removeClass("btn-primary");
            $(this).text("Pause game");
        } else {
            $(this).addClass("btn-primary");
            $(this).text("Start game");
        }
    });
})();
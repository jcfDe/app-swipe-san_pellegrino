$(document).ready(function() {
    /* $.mobile.autoInitializePage = false;
     $('.ui-loader').hide();*/
    $('.modal').hide();
    $('.button--finish').hide();
    localStorage.clear();


    //Oculta todas las páginas menos inicio

    $('.page').not('.page-start').hide();

    //Muestra la página de formulario

    $('.button--start').click(() => {
        $('.page-start').hide();
        $('.page-form').show();
    })

    // Comprueba campos y para a siguiente página
    function textTest(text) {
        const regExp_name = new RegExp(/^([A-Za-záéíóúñÁÉÍÓÚÑçÇÜü]+[\s-]?)+$/);
        return (text.length > 0 && regExp_name.test(text));
    }


    // Disable button
    function toggleButton() {
        let firstname = $('#firstname').val();
        let lastname = $('#lastname').val();

        if (firstname && lastname) {
            $('.button--next').prop('disabled', false);
        }
        else {
            $('.button--next').prop('disabled', true);
        }
    }

    // Deshabilitamos el botón al cargar la página
    toggleButton();

    // Detectamos cuando se escribe algo en los inputs
    $('.input').on('input', function() {
        toggleButton();
    });

    $('#form').submit(function(event) {

        event.preventDefault();

        let firstname = $('#firstname').val();
        let lastname = $('#lastname').val();

        $('#firstname').removeClass('danger');
        $('#lastname').removeClass('danger');

        //Chequea que los inputs sean válidos
        if (!textTest(firstname)) {
            $('#firstname').addClass('danger');
        }
        if (!textTest(lastname)) {
            $('#lastname').addClass('danger');
        }

        if (textTest(lastname) && textTest(firstname)) {
            localStorage.setItem('firstname', firstname);
            localStorage.setItem('lastname', lastname);
            $('.page-form').hide();
            $('.page-cards').show();
        }
    })



    //
    //Template HTML card
    function generateCard(id, src) {
        const card = `
            <div class="demo__card" data-id="${id}">
              <div class="demo__card__img">
                <img src=${src}>
                <div class="arrows">
                  <div class="arrows__arrow arrow-left"></div>
                  <div class="arrows__arrow arrow-right"></div>
                </div>
              </div>
              <div class="demo__card__choice m--reject">
                <div class="icon"></div>
              </div>
              <div class="demo__card__choice m--like">
                <div class="icon"></div>
              </div>
              <div class="demo__card__drag"></div>
            </div>`;

        const range = document.createRange();
        const fragment = range.createContextualFragment(card);

        return fragment;
    }

    //SWIPE ANIMATION
    var animating = false;
    var cardsCounter = 0;
    var numOfCards;
    var decisionVal = 80;
    var pullDeltaX = 0;
    var deg = 0;
    var $card, $cardReject, $cardLike;

    //Fetch al json de imágenes
    async function fillImages() {
        let response = await fetch('./assets/js/images.json')
        let json = await response.json();
        let images = json.images.reverse();
        numOfCards = images.length;

        images.map((item) => {
            let fragment = generateCard(item.id, item.src)
            $('.demo__card-cont').append(fragment)
        })
    }

    fillImages()

    function pullChange() {
        animating = true;
        deg = pullDeltaX / 10;
        $card.css("transform", "translateX(" + pullDeltaX + "px) rotate(" + deg + "deg)");

        var opacity = pullDeltaX / 50;
        var rejectOpacity = (opacity >= 0) ? 0 : Math.abs(opacity);
        var likeOpacity = (opacity <= 0) ? 0 : opacity;
        $cardReject.css("opacity", rejectOpacity);
        $cardLike.css("opacity", likeOpacity);

        if (pullDeltaX >= 0) {
            $('.arrow-right', $card).css('scale', "2")
            $('.arrow-left', $card).css('scale', "1")
        }
        else if (pullDeltaX <= 0) {
            $('.arrow-left', $card).css('scale', "2")
            $('.arrow-right', $card).css('scale', "1")
        }
    };

    function vote(value) {
        // Lee el array del local storage
        let votes = JSON.parse(localStorage.getItem('votes')) || [];

        let id = $card.data('id');
        let voteObj = { id: id, value: value };

        votes.push(voteObj);

        // Guarda el array actualizado en el local storage
        localStorage.setItem('votes', JSON.stringify(votes));
    }

    function release() {
        $('.arrow-left', $card).css('scale', "1")
        $('.arrow-right', $card).css('scale', "1")

        if (pullDeltaX >= decisionVal) {
            $card.addClass("to-right");
            vote(1);
        }
        else if (pullDeltaX <= -decisionVal) {
            $card.addClass("to-left");
            vote(0);
        }

        if (Math.abs(pullDeltaX) >= decisionVal) {
            $card.addClass("inactive");

            setTimeout(function() {
                $card.addClass("below").removeClass("inactive to-left to-right");
                cardsCounter++;
                if (cardsCounter === 20) {
                    showmodal();
                    $('.button--finish').show();
                }
                if (cardsCounter === numOfCards) {
                    showfinish();
                }
            }, 300);
        }

        if (Math.abs(pullDeltaX) < decisionVal) {
            $card.addClass("reset");
        }

        setTimeout(function() {
            $card.attr("style", "").removeClass("reset")
                .find(".demo__card__choice").attr("style", "");

            pullDeltaX = 0;
            animating = false;
        }, 300);
    };

    $(document).on("mousedown touchstart", ".demo__card:not(.inactive)", function(e) {
        if (animating) return;

        $card = $(this);
        $cardReject = $(".demo__card__choice.m--reject", $card);
        $cardLike = $(".demo__card__choice.m--like", $card);
        var startX = e.pageX || e.originalEvent.touches[0].pageX;

        $(document).on("mousemove touchmove", function(e) {
            var x = e.pageX || e.originalEvent.touches[0].pageX;
            pullDeltaX = (x - startX);
            if (!pullDeltaX) return;
            pullChange();
        });

        $(document).on("mouseup touchend", function() {
            $(document).off("mousemove touchmove mouseup touchend");
            if (!pullDeltaX) return; // prevents from rapid click events
            release();
        });
    });

    $('.button--yes').click(() => {
        $card = $(".demo__card:not(.below)").last();
        $cardReject = $(".demo__card__choice.m--reject", $card);
        $cardLike = $(".demo__card__choice.m--like", $card);
        $cardReject.css("opacity", 0);
        $cardLike.css("opacity", 1);
        pullDeltaX = decisionVal;
        release();
    });
    $('.button--not').click(() => {
        $card = $(".demo__card:not(.below)").last();
        $cardReject = $(".demo__card__choice.m--reject", $card);
        $cardLike = $(".demo__card__choice.m--like", $card);
        $cardReject.css("opacity", 1);
        $cardLike.css("opacity", 0);
        pullDeltaX = -decisionVal;
        release();
    });

});

//FUNCIONES MOSTRAR Y OCULTAR MODAL: 20 imagene, counter.

function showmodal() {
    $('.modal').show()
}

function hidemodal() {
    $('.modal').hide()
}

async function showfinish() {
    let name = localStorage.getItem("firstname")
    $('.name-container').text(name)
    $('.page:not(.page-end)').hide()
    $('.page-end').show()
    await sendData();
}

async function sendData() {
    let firstname = localStorage.getItem('firstname');
    let lastname = localStorage.getItem('lastname');
    let votes = localStorage.getItem('votes');
    let data = { firstname, lastname, votes };
    
    if(document.domain == 'sanpellegrino.devhogarth.com'){
        data['test']=true;
    }

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        mode: "cors",
        body: JSON.stringify(data),
        redirect: 'follow'
    };

    try {
        var response = await fetch("https://serviceoom.com/prod/san-pellegrino", requestOptions)
        var result = await response.json()
        if (response.status !== 200 || result.statusCode !== 200) {
            throw new Error(`Error al enviar los datos. Vuelve a cargar la página.`);
        }
        console.log(result);
    }
    catch (error) {
        alert(error.message);
    }

}

//LOTTIE

var animacion = bodymovin.loadAnimation({
    container: document.querySelector('.lottieImage'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: './assets/lottie/lottiesanp.json'
});



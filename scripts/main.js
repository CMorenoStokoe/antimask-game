/*

Main script
===========
Description:
This file runs the game.

Use:
This file is loaded by the web page on load.

*/

/* Startup */

    // Keep track of gamedata
    var gamestate = -1; // Current game level
    var turnsMadeInLevel2 = -1; // Turns made in level 2 (used to time protection moves by the AI); starts on -1 to account for initialisation action taken for player
    var healthyPanels = []; // List of healthy panels on map, for AI to select random healthy areas to protect
    var selectablePanels = []; // List of selectable panels, for game to determine end state
    var altLoseState = false; // Trigger a second lose message for variety on multiple losses
    var firstAiTurn = true; // Record first AI turn each game, to prevent it from repeating this move next game
    var lastFirstAiTurn = null; // Record first AI turn each game, to reduce the likelihood it repeats this move next game

    // Initialise game
    initialiseGame(); // Make first panel selectable, enabling gameplay

    // Assign failsafe functions which occur on modal dismiss (by 'x' button, tapping outside the modal area or pressing the intended button)
    $('#modal-welcome').on('hidden.bs.modal', function (e) { // Dismissing start modal starts game
        gamestate++; 
        initialiseGame();
    })
    // Assign failsafe functions which occur on modal dismiss (by 'x' button, tapping outside the modal area or pressing the intended button)
    $('#modal-start').on('hidden.bs.modal', function (e) { // Dismissing start modal starts game
        gamestate++; 
        initialiseGame();
    })
    $('#modal-win').on('hidden.bs.modal', function (e) { // Dismissing win modal on level 1 starts level 2
        gamestate++; 
        initialiseGame();
    })
    $('#modal-lose').on('hidden.bs.modal', function (e) { // Dismissing lose modal restarts level 2
        turnsMadeInLevel2=-1;
        initialiseGame();
    })
    $('#modal-lose2').on('hidden.bs.modal', function (e) { // Dismissing lose modal restarts level 2
        turnsMadeInLevel2=-1;
        initialiseGame();
    })
    $('#modal-end').on('hidden.bs.modal', function (e) { // Dismissing end modal restarts game
        gamestate=0; 
        initialiseGame();
    })


    // Initialise URL share button
    document.getElementById("copyButton").addEventListener("click", function() { // Copy text to clipboard for URL share button
        copyToClipboard('https://www.morenostok.io/WearAMask/');
    });
    $(function () { // Enable pop-out text
        $('[data-toggle="popover"]').popover()
    })


    // Initialise share buttons
    $('#modal-end').on('shown.bs.modal', function (e) {
        
        window.twttr = (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0],
            t = window.twttr || {};
        if (d.getElementById(id)) return t;
        js = d.createElement(s);
        js.id = id;
        js.src = "https://platform.twitter.com/widgets.js";
        fjs.parentNode.insertBefore(js, fjs);
    
        t._e = [];
        t.ready = function(f) {
            t._e.push(f);
        };
    
        return t;
        }(document, "script", "twitter-wjs"));
    });


    // Preload Images (Adapted from: https://stackoverflow.com/questions/476679/preloading-images-with-jquery)
    const panelNames = ['nehousing','northpark','centralpark','ugpark','concrete','hospital','school','end']
    const imageNames = [];
    for(const panelName of panelNames){ // Get images to preload
        imageNames.push(`images/map/normal/${panelName}.png`);
        imageNames.push(`images/map/infected/${panelName}.png`);
        imageNames.push(`images/map/protected/${panelName}.png`);
    }
    preload(imageNames); // Preload all images using function

    function preload(arrayOfImages) { // Function to preload images
        $(arrayOfImages).each(function(){
            (new Image()).src = this;
        });
    }


/* Initialisation functions */

    // Function to copy text to clipboard (Credit: https://stackoverflow.com/questions/22581345/click-button-copy-to-clipboard-using-jquery)
    function copyToClipboard(text) {

        // Create a "hidden" input
        var aux = document.createElement("input");
    
        // Assign it the value of the specified element
        aux.setAttribute("value", text);
    
        // Append it to the body
        document.body.appendChild(aux);
    
        // Highlight its content
        aux.select();
    
        // Copy the highlighted text
        document.execCommand("copy");
    
        // Remove it from the body
        document.body.removeChild(aux);
    
    }

    
    // Initialise the game state for the current level
    function initialiseGame(){
        console.log(`Initialising game with gamestate = ${gamestate}`)

        switch(gamestate){

            case -1: // Open welcome message
                $('#modal-welcome').modal('toggle');
                break;

            case 0: // Open how to play after welcome
                $('#modal-start').modal('toggle');
                break;

            case 1: // Initialise game by infecting the starting panel
                resetGame();
                infect('start');
                break;

            case 2: // Initialise game by infecting the starting panel and protecting a panel
                resetGame();
                initialiseHealthyStates();
                infect('start');
                break;
            
            case 3: // Open end game debrief
                resetGame();
                $('#modal-end').modal('toggle');
                break;
        }
    }


    // Populate healthy panel list for AI to randomly protect areas in level 2
    function initialiseHealthyStates(){

        // Reset list of healthy panels
        healthyPanels = [];

        // Add all panels to healthy list
        for(const [key, value] of Object.entries(panels)){

            // Do not add start or end panels, and leave ugpark for special activation on Joe event
            //if(key == 'start' || key == 'nehousing' || key == 'end' || key == 'ugpark'){continue;}

            // Push panel to array
            healthyPanels.push(key);
        } 

        // Shuffle list of healthy panels for randomness
        //shuffle(healthyPanels);
        //console.log(`Randomised healthyPanels list: `, healthyPanels)
    }
/*

Game
===========
Description:
This file contains the functions to run the game.

Use:
This file is called by the main script.

*/

// Second temp var used by ai in lvl 2 for same purpose as similar var in main script
var aiTurns=0; 

// Dict of panels and neighboring areas you can infect from them
const panels = {
    'start' : ['nehousing',],
    'northpark' : ['centralpark','concrete'],
    'concrete' : ['hospital','northpark', 'centralpark'],
    'nehousing' : ['northpark','concrete'],
    'centralpark' : ['ugpark','hospital'],
    'ugpark' : ['end','school'],
    'hospital' : ['concrete','ugpark','centralpark','school'],
    'school' : ['end','ugpark','hospital','northpark'],
    'end' : []
}

// Function to infect a map sector changing the image and making it unselectable
function infect(panelId){
    console.log(`Infecting: ${panelId}`);

    // If level 2 then increment player moves for AI move timing
    if(gamestate == 2){turnsMadeInLevel2++}; 

    switch(panelId){
        case 'start': // If this is the start the initialise the starting choice(s)
        
            // Make neighbouring areas selectable
            setNeighbours('start'); 
            
            // If level 2 then make AI protection turn
            if(gamestate == 2){AITurn()}; 

            break;
        
        case 'end': // If this is the last panel, signal the win condition
            
            // Set panel as selected
            setSelected(panelId);

            // Toggle win state modal in lvl 1
            if(gamestate==1){$('#modal-win').modal('toggle');}
            else if(gamestate==2){$('#modal-end').modal('toggle');}
            break;

        case 'centralpark':

            // Set panel as selected
            setSelected(panelId);

            // Make neighbouring areas selectable
            setNeighbours(panelId); 
            
            // If level 2 then make AI protection turn
            if(gamestate == 2){AITurn()}; 
            break;

        case 'hospital':

            // Set panel as selected
            setSelected(panelId);

            // Make neighbouring areas selectable
            setNeighbours(panelId); 
            
            // If level 2 then make AI protection turn
            if(gamestate == 2){AITurn()}; 
            break;

        default: // For a regular panel

            // Set panel as selected
            setSelected(panelId);

            // Make neighbouring areas selectable
            setNeighbours(panelId); 
            
            // If level 2 then make AI protection turn
            if(gamestate == 2){AITurn()}; 

            break;
    }


    // Set panel as selected
    function setSelected(panelId){
        
        // Get panel img element on dom by its Id
        var panel = document.getElementById(panelId);
        
        // Replace image with infected version
        switch(panel.className){
            case 'rebel-selectable': // Joe's central park tile is the only protected tile which can be infected, so handle differently
                panel.src = panel.src.replace('rebelled', 'infected');
                break;
            
            case 'selectable': // All healthy panels
                panel.src = panel.src.replace('normal', 'infected');
                break;
        }

        // Set class as infected
        panel.className='infected';

        // Remove event listeners so this panel can't be selected
        var old_element = document.getElementById(panelId);
        var new_element = old_element.cloneNode(true);
        old_element.parentNode.replaceChild(new_element, old_element);
        
        // Remove from healthy panels list
        removeFromArray(healthyPanels, panelId);
        
        // Remove from selectable panels list
        if(selectablePanels.includes(panelId)){removeFromArray(selectablePanels, panelId)}

    }

    // Set neighboring nodes as selectable
    function setNeighbours(panelId){

        // Access dictionary of neighbours for each panel in the 'panels' object
        for(const neighbor of panels[panelId]){

            // Set neighbors as selectable
            neighborPanel = document.getElementById(neighbor);

            switch(neighborPanel.className){
                case 'infected':
                    break;

                case 'selectable':
                    break;

                case 'protected':
                    break;

                case 'rebel-selectable':
                    break;
                
                case 'rebel':
                    
                    // Add to list of selectable panels for end game status
                    selectablePanels.push(neighbor);

                    // Make neighbour selectable
                    neighborPanel.addEventListener("click", function(){infect(this.id)});
                    neighborPanel.className = 'rebel-selectable';

                    break;

                default:
                    // Add to list of selectable panels for end game status
                    selectablePanels.push(neighbor);

                    // Make neighbour selectable
                    neighborPanel.addEventListener("click", function(){infect(this.id)});
                    neighborPanel.className = 'selectable';

                    break;
            }
        }
    }
}

// Function to 'protect' an area and prevent infecting this area (e.g., wearing masks); changes the image and makes it unselectable
isSecondPlay=false;
function protect(panelId){
    
    // Get panel img element on dom by its Id
    var panel = document.getElementById(panelId);

    // Replace image with infected version
    panel.src = panel.src.replace('normal', 'protected');

    // Set class as protected
    panel.className='protected';

    // Remove event listeners so this panel can't be selected
    var old_element = document.getElementById(panelId);
    var new_element = old_element.cloneNode(true);
    old_element.parentNode.replaceChild(new_element, old_element);

    // Remove from healthy panels list
    removeFromArray(healthyPanels, panelId);

    // Remove from selectable panels list
    if(selectablePanels.includes(panelId)){ removeFromArray(selectablePanels, panelId) }

    // If last available panel was protected, trigger lose state
    if(!(isSecondPlay)){

        if(!(selectablePanels.length>0)){ 
            setTimeout(function(){
                startSecondPlaythrough();
            }, 1500)
        };
    }
}

// Function to attempt to protect an area but have the inhabitant rebel and not wear a mask, allowing infection as normal
function rebel(panelId){
    console.log('rebelling', panelId)
    // Get panel img element on dom by its Id
    var panel = document.getElementById(panelId);
    
    // Replace image with infected version
    panel.src = panel.src.replace('normal', 'rebelled');
    
    // Set class as rebel or rebel selectable depending on whether the player can select it
    if(document.getElementById('centralpark').className == 'infected' || document.getElementById('hospital').className == 'infected' || document.getElementById('school').className == 'infected'){
        panel.className='rebel-selectable';
    } else {
        panel.className='rebel';
    }
    
    // Remove from healthy panels list
    removeFromArray(healthyPanels, panelId);
}

// Function to reset the game
function resetGame(){

    // Reset moves 
    aiTurns = 0;

    // Reset panels
    for(const [key,value] of Object.entries(panels)){
        
        if(key == 'start'){continue;} // Skip start panel

        // Reset panel states (images and classes)
        panel = document.getElementById(key);
        panel.className = ('unselectable');
        panel.src = panel.src.replace('infected', 'normal');
        panel.src = panel.src.replace('protected', 'normal');
        
        // Remove event listeners so this panel can't be selected
        var old_element = document.getElementById(key);
        var new_element = old_element.cloneNode(true);
        old_element.parentNode.replaceChild(new_element, old_element);

        // Reset selectable panels list
        selectablePanels = [];

        // Reset number of turns player and AI have made in level 2
        turnsMadeInLevel2 = -1;
        firstAiTurn = true;
    }
        
}

// AI for level 2
aiMoves=['concrete', 'hospital', 'school', 'ugpark']
function AITurn(){

    console.log(aiTurns)

    // Rebel ugpark on second playthrough instead of protecting it
    if(isSecondPlay){
        if(aiTurns===0){
            rebel('ugpark');
        }
        if(aiTurns===3){
            return;
        }
    }

    // Trigger lose condition if no available moves left for player
    if(!(selectablePanels.length>0)){  startSecondPlaythrough(); } 
    
    // Else play AI turn
    protect(aiMoves[aiTurns]);

    aiTurns++;
}

// Fisher-Yates shuffle algorithm (https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm)
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

// Remove specific item from array
function removeFromArray(array, item){
    const index = array.indexOf(item);
    if (index > -1) {
      array.splice(index, 1);
    }
}

function startSecondPlaythrough(){
    isSecondPlay = true;

    $('#modal-lose').modal('toggle');
}

// Quick message
function showMessage(tile){
    console.log('Government vaccinated ', tile)
}
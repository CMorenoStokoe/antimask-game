/*

Game
===========
Description:
This file contains the functions to run the game.

Use:
This file is called by the main script.

*/

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
            if(gamestate == 2){AITurn(turnsMadeInLevel2)}; 

            break;
        
        case 'end': // If this is the last panel, signal the win condition
            
            // Set panel as selected
            setSelected(panelId);

            // Toggle win state modal in lvl 1
            if(gamestate==1){$('#modal-win').modal('toggle');}
            else if(gamestate==2){$('#modal-end').modal('toggle');}
            break;

        default: // For a regular panel

            // Set panel as selected
            setSelected(panelId);

            // Make neighbouring areas selectable
            setNeighbours(panelId); 
            
            // If level 2 then make AI protection turn
            if(gamestate == 2){AITurn(turnsMadeInLevel2)}; 

            break;
    }


    // Set panel as selected
    function setSelected(panelId){
        
        // Get panel img element on dom by its Id
        var panel = document.getElementById(panelId);
        
        // Replace image with infected version
        switch(panel.className){
            case 'rebel-selectable': // Joe's central park tile is the only protected tile which can be infected, so handle differently
                panel.src = panel.src.replace('protected', 'infected');
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
function protect(panelId){

    // If joe's rebel park panel, then rebel instead of protect
    if(panelId == 'ugpark'){rebel(panelId); return;}
    
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
    if(selectablePanels.includes(panelId)){removeFromArray(selectablePanels, panelId)}

    // If last available panel was protected, trigger lose state
    if(!(selectablePanels.length>0)){

        // Trigger lose condition if no available moves left for player
        $('#modal-lose').modal('toggle');
        return;
    }
}

// Function to attempt to protect an area but have the inhabitant rebel and not wear a mask, allowing infection as normal
function rebel(panelId){

    // Get panel img element on dom by its Id
    var panel = document.getElementById(panelId);
    
    // Replace image with infected version
    panel.src = panel.src.replace('normal', 'protected');
    
    // Set class as rebel or rebel selectable depending on whether the player can select it
    if(document.getElementById('centralpark').className == 'infected' || document.getElementById('hospital').className == 'infected' || document.getElementById('school').className == 'infected'){
        panel.className='rebel-selectable';
    } else {
        panel.className='rebel';
    }
    
    // Remove from healthy panels list
    removeFromArray(healthyPanels, panelId);

    // Pop up modal
    $('#modal-opportunity').modal('toggle');
}

// Function to reset the game
function resetGame(){

    for(const [key,value] of Object.entries(panels)){
        console.log(`Resetting ${key}:`, document.getElementById(key))
        
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

        // Reset number of turns player has made in level 2
        turnsMadeInLevel2 = -1;
    }
        
}

// AI for level 2
function AITurn(){

    if(!(selectablePanels.length>0)){

        // Trigger lose condition if no available moves left for player
        $('#modal-lose').modal('toggle');
        return;
    }

    if(healthyPanels.length>0){

        // Anti-frustration system to prevent immediate loss
        while(
            turnsMadeInLevel2 == 1 
            &&
            (
                !(healthyPanels.includes('northpark')) ||
                !(healthyPanels.includes('concrete'))
            )
            &&
            (
                healthyPanels[0] == 'northpark' || 
                healthyPanels[0] == 'concrete'
            )
        ){
            console.log('anti-frustration intervention')
            shuffle(healthyPanels)
        }

        // Better game play system to not have the joe pop up occur immediately on game start
        while(
            turnsMadeInLevel2 < 2
            &&
            healthyPanels[0] == 'ugpark'
        ){
            console.log('anti joe confusion intervention')
            shuffle(healthyPanels);
        }

        // Protect the first panel in the randomised list of healthy panels
        console.log(`Possible moves: ${selectablePanels.length}, turns: ${turnsMadeInLevel2}, AI move: ${healthyPanels[0]}`)
        protect(healthyPanels[0]);

        return;
        
    } 
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
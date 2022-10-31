const GameBoard = (() =>{
    let gameboard = ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"];
    let players = {player1: "", player2: ""};
    let gameOn = false;
    let botTurn = true;
    const addPlayer = (player) => {
        if(players.player1 == ""){
            players.player1 = player;
            players.player1.playerNumber = 1;
        }
        else if(players.player2 == ""){
            players.player2 = player;
            players.player2.playerNumber = 2;;
        }
        console.log(players);
    };
    const getPlayers = () => {
        return [players.player1, players.player2];
    }
    const deletePlayer = (index) =>{
        if(index){
            players.player2 = "";
        }
        else{
            players.player1 = players.player2;
            players.player2 = "";
        }
    };
    let marker = "x";
    const changeMarker = (newMarker) =>{
        marker = newMarker;
    }
    const updateBoard = (move) =>{
        if(gameboard[move] == "empty" && gameOn == true && botTurn){
            gameboard[move] = marker;
            console.log(gameboard);
            events.emit('updateBoardDisplay', gameboard);
            events.emit('makeAMoveBot', gameboard);
        }
    };
    const updateBoardFromBot = (move) =>{
        if(gameboard[move] == "empty" && gameOn == true){
            gameboard[move] = marker;
            console.log(gameboard);
            events.emit('updateBoardDisplay', gameboard);
        }
        if(( players.player1.isABot() || players.player1.isAHardBot() ) && ( players.player2.isABot() || players.player2.isAHardBot() ))
            events.emit('makeAMoveBot', gameboard);
        
    };
    const botTurnToggle = (bol) =>{
        botTurn = bol;
    };
    const gameOnToggle = (bol) =>{
        gameOn = bol;
    };
    const clearBoard = () =>{
        for(let i = 0; i <=8; i++){
            gameboard[i]= "empty";
        }
    }
    events.on('addPlayer', addPlayer);
    events.on('deletePlayer', deletePlayer);
    events.on("turnChange", changeMarker);
    events.on('moveMade', updateBoard);
    events.on('gameOn', gameOnToggle);
    events.on('reset', clearBoard);
    events.on('isNotBotTurn', botTurnToggle);
    events.on('botMoveMade', updateBoardFromBot)

    return{getPlayers};
})();

const Player = (name) => {
    let playerNumber = "";
    let isBot = false;
    let isHardBot = false;
    if(name == "_BOT"){
        isBot = true;
    }
    if(name == "HARD_BOT"){
        isHardBot = true;
    }
    const getName = () => name;
    const placeMarker = place =>{
        events.emit('moveMade', place);
    };
    const setPlayerNumber = (index) =>{
        this.playerNumber = index;
    }
    const isABot = () => isBot;
    const isAHardBot = () => isHardBot;
    
    const getPlayerNumber = () => playerNumber;
    return {getName, placeMarker, getPlayerNumber, isABot, isAHardBot, playerNumber};
};

const gameFlow = (() =>{
    let players = GameBoard.getPlayers();
    let currentTurn = players[0];
    const startBtn = document.querySelector('#start');
    startBtn.addEventListener('click', function(){startGame()});
    const startGame = () =>{
        let players = GameBoard.getPlayers();
        let playerOne = players[0];
        let playerTwo = players[1];
        if(typeof playerOne == "object" && typeof playerTwo == "object")
        {
            events.emit('reset');
            events.emit('newGame');
            events.emit("gameOn", true);
        } else{
            events.emit("gameOn", false);
        }
    };
    const changeTurn = () =>{
        if(currentTurn == players[0]){
            currentTurn = players[1];
            events.emit("turnChange", "o");
            events.emit('changePlayerColor', 2);
        }
        else{
            currentTurn = players[0];
            events.emit("turnChange", "x");
            events.emit('changePlayerColor', 1);
        }
    };
    const setTurn = () => {
        players = GameBoard.getPlayers();
        currentTurn = players[0];
        events.emit("turnChange", "x");
        events.emit('changePlayerColor', 1);
    };
    const anyWinners = (gameboard) => {
        let zero = gameboard[0];
        let one = gameboard[1];
        let two = gameboard[2];
        let three = gameboard[3];
        let four = gameboard[4];
        let five = gameboard[5];
        let six = gameboard[6];
        let seven = gameboard[7];
        let eight = gameboard[8];
        let winPossiblities = [];
        winPossiblities.push(zero + one + two);
        winPossiblities.push(three + four + five);
        winPossiblities.push(six + seven + eight);
        winPossiblities.push(zero + three + six);
        winPossiblities.push(one + four + seven);
        winPossiblities.push(two + five + eight);
        winPossiblities.push(zero + four + eight);
        winPossiblities.push(six + four + two);

        let gameTie = true;
        winPossiblities.forEach((winSet) =>{
            if(winSet == "xxx")
            {
                let players = GameBoard.getPlayers();
                events.emit('gameWon', players[0]);
                events.emit('gameOn', false);
                gameTie = false;
            }
            if(winSet == "ooo")
            {
                let players = GameBoard.getPlayers();
                events.emit('gameWon', players[1]);
                events.emit('gameOn', false);
                gameTie = false;
            }
        });
        for(let i = 0; i <=8; i++){
            let mark = gameboard[i];
            if(mark == "empty")
            {
                gameTie = false;
            }
        }
        if(gameTie){
            events.emit('gameTie', "");
            events.emit('gameOn', false);
        }
    };
    events.on('updateBoardDisplay', changeTurn);
    events.on('updateBoardDisplay', anyWinners);
    events.on('addPlayer', setTurn);
    events.on('deletePlayer', startGame);
    events.on('newGame', setTurn);
})();
const displayController = (() =>{
    const marks = Array.from(document.querySelectorAll('.mark'));
    console.log(marks);
    let gameOn = false;
    const gameOnToggle = (bol) =>{
        gameOn = bol;
        if(bol){
            marks.forEach( (spot) => {
                spot.style.backgroundColor = "rgba(255, 255, 255)";
            });
        }
        else{
            marks.forEach( (spot) => {
                spot.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
            });
        }
    };
    marks.forEach((item, index) =>{
        item.addEventListener('click', function(){
            events.emit('moveMade', index);
        });
        item.addEventListener('mouseenter', () =>{
            if(gameOn)
            item.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
        });
        item.addEventListener('mouseleave', () =>{
            if(gameOn)
            item.style.backgroundColor = "rgba(255, 255, 255)";
        });
    });
    const updateBoardDisplay = (gameboard) =>{
        for(let i = 0; i <=8; i++){
            let div = marks[i];
            let mark = gameboard[i];
            if(mark == "x"){
                div.innerHTML=`
                <svg  viewBox="0 0 24 24">
                    <path fill="currentColor" d="M13.46,12L19,17.54V19H17.54L12,13.46L6.46,19H5V17.54L10.54,12L5,6.46V5H6.46L12,10.54L17.54,5H19V6.46L13.46,12Z" />
                </svg>`;
                div.classList.add(gameboard[i] + "-mark");
            }
            else if(mark == "o"){
                div.innerHTML=`
                <svg  viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                </svg>`;
                div.classList.add(gameboard[i] + "-mark");
            }

        }
    };
    const deleteDisplay = () =>{
        for(let i = 0; i <=8; i++){
            let div = marks[i];
            let child = div.children[0];
            if(child !== undefined)
                div.removeChild(child);
                div.setAttribute('class', "mark");
        }
        let JS = document.getElementById('player-name');
        let TicTacToe = document.getElementById('has-won');
        JS.innerText = 'JS';
        TicTacToe.innerText = "TicTacToe";
    }
    const displayWinner = (player) => {
        let JS = document.getElementById('player-name');
        let TicTacToe = document.getElementById('has-won');
        JS.innerText = `Player ${player.playerNumber} : ${player.getName()}`;
        TicTacToe.innerText = "Has Won!";
    };
    const displayTie = () => {
        let JS = document.getElementById('player-name');
        let TicTacToe = document.getElementById('has-won');
        JS.innerText = "It's a Tie.";
        TicTacToe.innerText = "Nobody Wins.";
    };
    events.on('gameWon', displayWinner);
    events.on('gameTie', displayTie);
    events.on('updateBoardDisplay', updateBoardDisplay);
    events.on('gameOn', gameOnToggle);
    events.on('reset', deleteDisplay);

})();


const PlayerDisplay = (() =>{
    const addBtn = document.querySelector("#add-player");
    const botBtn = document.querySelector("#add-bot");
    const nameBtn = document.querySelector("#name-input");
    const players = document.getElementById("players");
    const hardBotBtn = document.querySelector("#add-hard-bot");
    addBtn.addEventListener("click", function(){
        let value = nameBtn.value;
        if(value !== ""){
            const newPlayer = Player(value);
            events.emit("addPlayer", newPlayer);
            display();
            nameBtn.value = "";
        }
    });
    botBtn.addEventListener('click', function(){
        const newPlayer = Player("_BOT");
        events.emit("addPlayer", newPlayer);
        display();

    });
    hardBotBtn.addEventListener('click', function(){
        const newPlayer = Player("HARD_BOT");
        events.emit("addPlayer", newPlayer);
        display();

    });
    const display = () => {
            deleteDisplay();
            let currentPlayers = GameBoard.getPlayers();
            currentPlayers.forEach((element, index)=> {
                console.log(typeof element);
                let playerCount = 1;
                if(typeof element == "object"){
                    let id = "player-" + (playerCount + index);
                    let label = document.createElement("label");
                        label.setAttribute("for", id);
                        label.innerText = "Player " + (playerCount + index) + ":";
                    if(index){
                        label.style.color = "blue";
                    }
                    else{
                        label.style.color = "red";
                    }
                    let li = document.createElement("li");
                        li.setAttribute("id", id);
                        li.player = index;
                    let span = document.createElement("span");
                    span.innerText = element.getName();
                    li.appendChild(span);
                    if(index){
                        li.innerHTML+= `
                        <svg  viewBox="0 0 24 24" class="rmBtn">
                            <path fill="currentColor" d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                        </svg>`;
                    }
                    else{
                        li.innerHTML+= `
                            <svg  viewBox="0 0 24 24" class="rmBtn">
                                <path fill="currentColor" d="M13.46,12L19,17.54V19H17.54L12,13.46L6.46,19H5V17.54L10.54,12L5,6.46V5H6.46L12,10.54L17.54,5H19V6.46L13.46,12Z" />
                            </svg>`;
                    }
                    players.appendChild(label);
                    players.appendChild(li);
                    removeBtnCreation(index);
                }
            });
    };
    const deleteDisplay = () => {
        let children = Array.from(players.children);
        children.forEach((child) =>{
            players.removeChild(child);
        });

    };
    const removeBtnCreation = (index) => {
        const removeBtn = Array.from(document.querySelectorAll(".rmBtn"));
        let btn = removeBtn[index];
        btn.addEventListener("click", function(){
            let li = btn.parentElement;
            events.emit('deletePlayer', li.player);
            display();
        });
    };
    const changePlayerColor = (player) =>{
        if(player == 1){
            if(players.children.length !== 0){
                let player1 = players.children[1];
                player1.style.backgroundColor = "#2DD4BF";
            }
            if(players.children.length > 2){
                let player2 = players.children[3];
                player2.style.backgroundColor = "white";
            }
        }else{
            let player1 = players.children[1];
            player1.style.backgroundColor = "white";
            let player2 = players.lastElementChild;
            player2.style.backgroundColor = "#2DD4BF";
        }
    };

    events.on('changePlayerColor', changePlayerColor);
})();

const botController = (() => {
    let botTimeoutID
    let isGameOver = false;

    const makeFirstMove = (bol) =>{
        let players = GameBoard.getPlayers();
        if(botTimeoutID !== null)
            clearTimeout(botTimeoutID);
        console.log(players);
        events.emit('isNotBotTurn', true);
        if(bol && players[0].isAHardBot())
        {
            events.emit('isNotBotTurn', false);
            botTimeoutID = setTimeout( () =>{
                events.emit('botMoveMade', 4);
                if(!( ( players[0].isABot() || players[0].isAHardBot() ) && ( players[1].isABot() || players[1].isAHardBot() ) ) ) 
                    events.emit('isNotBotTurn', true);
            }, 1000);
            
        }
        else if(bol && players[0].isABot()){
            let index = Math.floor(Math.random() * 9);
            botTimeoutID = setTimeout( () =>{
                events.emit('botMoveMade', index);
                if(!( ( players[0].isABot() || players[0].isAHardBot() ) && ( players[1].isABot() || players[1].isAHardBot() ) ) )
                    events.emit('isNotBotTurn', true);
            }, 1000);
        }
        
            
    };


    const makeRandomMove = (gameboard) => {
        let players = GameBoard.getPlayers();
        
                events.emit('isNotBotTurn', false);
                let validSpaces = [];
                let i = 0;
                while(i < gameboard.length){
                    if(gameboard[i] == "empty")
                        validSpaces.push(i);
                    i++;
                }
                let index = Math.floor(Math.random() * validSpaces.length);
                let selectedSpace = validSpaces[index];
                botTimeoutID = setTimeout( () =>{
                    events.emit('botMoveMade', selectedSpace);

                    let p1 = players[0].isABot();
                    let p2 = players[0].isAHardBot();
                    let p3 = players[1].isABot()
                    let p4 = players[1].isABot();

                    let result = ( players[0].isABot() || players[0].isAHardBot() ) && ( players[1].isABot() || players[1].isAHardBot() );

                    if(!( ( players[0].isABot() || players[0].isAHardBot() ) && ( players[1].isABot() || players[1].isAHardBot() ) ) )
                        events.emit('isNotBotTurn', true);
                }, 1000);
            
        
    };

    const makeOptimizedMove = (gb, player, opponent) => {
        let players = GameBoard.getPlayers();

        
                events.emit('isNotBotTurn', false);
                

                //call the optimized function
                //And return index of best move
                let bestMove = botTest(gb, player, opponent);
                function botTest(gb, player, opponent){
                    const gameboard = gb;
                
                    let value = -1;
                    let indexOfMove = 0;
                    for(let i = 0; i < gameboard.length; i++){
                    if(gameboard[i] != player && gameboard[i] != opponent)
                    {
                        gameboard[i] = player;
                        temp = Math.max(evaluate(), middle(i), pairTwo(), blockTwo(i), specialCase(i), blockDoubleWin(i));
                        if(temp > value)
                        {
                        value = temp;
                        indexOfMove = i;
                        }
                        gameboard[i] = "empty";
                    }
                    }
                
                    console.log(`Value: ${value}`);
                    console.log(`Index: ${indexOfMove}`);
                    console.log("");
                
                    function evaluate(){
                    let score = 0;
                
                    let zero = gameboard[0];
                    let one = gameboard[1];
                    let two = gameboard[2];
                    let three = gameboard[3];
                    let four = gameboard[4];
                    let five = gameboard[5];
                    let six = gameboard[6];
                    let seven = gameboard[7];
                    let eight = gameboard[8];
                    let winPossiblities = [];
                    winPossiblities.push(zero + one + two);
                    winPossiblities.push(three + four + five);
                    winPossiblities.push(six + seven + eight);
                    winPossiblities.push(zero + three + six);
                    winPossiblities.push(one + four + seven);
                    winPossiblities.push(two + five + eight);
                    winPossiblities.push(zero + four + eight);
                    winPossiblities.push(six + four + two);
                    winPossiblities.forEach((winSet) =>{
                        if(winSet == "xxx" && player == 'x'){
                        score = 10;
                        }
                        if(winSet == "ooo" && player == 'o')
                        score = 10;
                    });
                    return score;
                    }
                    function middle (index){
                    let four = gameboard[4];
                    return (index == 4 && four == player) ? 8 : 0;
                    }
                    function specialCase(index){
                        let zero = gameboard[0];
                        let four = gameboard[4];
                        let eight = gameboard[8];
                    
                        let score = 0;
                        if(four == eight && four == opponent && zero == player && 2 == index)
                        score = 5;
                        return score;
                    }
                    function blockDoubleWin(index){
                        let zero = gameboard[0];
                        let two = gameboard[2];
                        let three = gameboard[3];
                        let four = gameboard[4];
                        let five = gameboard[5];
                        let six = gameboard[6];
                        let seven = gameboard[7];
                        let eight = gameboard[8];
                    
                        let score = 0;
                        //Player 1
                        if(two == six && two == opponent && four == player && 1 == index && seven == 'empty')
                            score = 7;
                        if(two == seven && two == opponent && four == player && 8 == index && zero == 'empty')
                        score = 7;
                        if(five == seven && five == opponent && four == player && 8 == index && zero == 'empty')
                        score = 7;
                        if(five == six && five == opponent && four == player && 8 == index && zero == 'empty')
                        score = 7;
                        
                        //Player 2
                        if(zero == seven && zero == opponent && four == player && 6 == index && eight == 'empty')
                        score = 7;
                        if(three == seven  && three == opponent && four == player && 6 == index && eight == 'empty')
                        score = 7;
                        if(three == eight && three == opponent && four == player && 6 == index && eight == 'empty')
                        score = 7;
                        return score;
                    }
                    function pairTwo(){
                    let zero = gameboard[0];
                    let two = gameboard[2];
                    let four = gameboard[4];
                    let six = gameboard[6];
                    let eight = gameboard[8];
                
                    let score = 0
                    //Horizontal Loop pairing
                    for(let i = 0; i < 8; i++){
                        let first = gameboard[i];
                        let next = gameboard[i+1];
                        if(first == next && first == player)
                        {
                        if(i == 0 || i == 3 || i == 6)
                        {
                            let last = gameboard[i+2];
                            if(last == "empty")
                            score = 4;
                        }
                        else if(i == 1 || i == 4 || i == 7)
                        {
                            let last = gameboard[i-1];
                            if(last == "empty")
                            score = 4;
                        }
                        } 
                    }
                
                    //vertical loop pairing
                    for(let i = 0; i < 6; i++){
                        let first = gameboard[i];
                        let next = gameboard[i+3];
                        if(first == next && first == player)
                        {
                        if(i == 0 || i == 1 || i == 2){
                            let last = gameboard[i+6];
                            if(last == "empty")
                            score = 4;
                        }else{
                            let last = gameboard[i-3];
                            if(last == "empty")
                            score = 4;
                        }
                        }
                    }
                
                    //diagonals
                    // 0 4 empty
                    if(zero == four && eight == 'empty' && zero == player)
                        score = 4;
                    // empty 4 8
                    if(four == eight && zero == 'empty' && four == player)
                        score = 4;
                    // 2 4 empty
                    if(two == four && six == 'empty' && two == player)
                        score = 4;
                    // empty 4 6
                    if(four == six && two == 'empty'  && four == player)
                        score = 4;
                
                    
                    //Horizontal Space Between Pairing
                    for(let i = 0; i < 7; i++){
                        let first = gameboard[i];
                        let next = gameboard[i+2];
                        if(first == next && first == player){
                        if(i % 3 == 0){
                            let index = (i + (i+2)) / 2;
                            let last = gameboard[index];
                            if(last == "empty")
                            score = 4;
                        }
                        }
                    }
                
                    //Vertical Space Between Pairing
                    for(let i = 0; i < 3; i++){
                        let first = gameboard[i];
                        let next = gameboard[i+6];
                        if(first == next && first == player){
                        let index = (i + (i+6)) / 2;
                        let last = gameboard[index];
                        if(last == "empty")
                            score = 4;
                        }
                    }
                
                    //Diagonals Space Between Pairing
                    // 0 x 8
                    // 2 x 6
                    if((zero == eight || two == six) && four == 'empty'  && (zero == player || two == player))
                        score = 4;
                
                    return score;
                
                    }
                
                    function blockTwo(index){
                    let zero = gameboard[0];
                    let two = gameboard[2];
                    let four = gameboard[4];
                    let six = gameboard[6];
                    let eight = gameboard[8];
                
                    let score = 0
                    //Horizontal Loop
                    for(let i = 0; i < 8; i++){
                        let first = gameboard[i];
                        let next = gameboard[i+1];
                        if(first == next && first == opponent)
                        {
                        if(i == 0 || i == 3 || i == 6)
                        {
                            let last = i+2;
                            if(last == index)
                            {
                            last = gameboard[i+2];
                            if(last == player)
                                score = 6;
                            }
                        }
                        else if(i == 1 || i == 4 || i == 7)
                        {
                            let last = i-1;
                            if(last == index)
                            {
                            last = gameboard[i-1];
                            if(last == player)
                                score = 6;
                            }
                        }
                        } 
                    }
                
                    //vertical loop
                    for(let i = 0; i < 6; i++){
                        let first = gameboard[i];
                        let next = gameboard[i+3];
                        if(first == next && first == opponent)
                        {
                        if(i == 0 || i == 1 || i == 2){
                            // let last = gameboard[i+6];
                            // if(last == player)
                            //   score = 6;
                            let last = i+6;
                            if(last == index){
                            last = gameboard[i+6];
                            if(last == player)
                                score = 6;
                            }
                        }else{
                            // let last = gameboard[i-3];
                            // if(last == player)
                            //   score = 6;
                            let last = i-3;
                            if(last == index){
                            last = gameboard[i-3];
                            if(last == player)
                                score = 6;
                            }
                        }
                        }
                    }
                
                    //diagonals
                    // 0 4 x
                    if(zero == four && eight == player && zero == opponent && 8 == index)
                        score = 6;
                    // x 4 8
                    if(four == eight && zero == player && four == opponent  && 0 == index)
                        score = 6;
                    // 2 4 x
                    if(two == four && six == player && two == opponent  && 6 == index)
                        score = 6;
                    // x 4 6
                    if(four == six && two == player  && four == opponent  && 2 == index)
                        score = 6;
                
                    //Horizontal Space Between
                    for(let i = 0; i < 7; i++){
                        let first = gameboard[i];
                        let next = gameboard[i+2];
                        if(first == next && first == opponent){
                        if(i % 3 == 0){
                            let indx = (i + (i+2)) / 2;
                            if(indx == index)
                            {
                            let last = gameboard[indx];
                            if(last == player)
                            score = 6;
                            }
                        }
                        }
                    }
                
                    //Vertical Space Between
                    for(let i = 0; i < 3; i++){
                        let first = gameboard[i];
                        let next = gameboard[i+6];
                        if(first == next && first == opponent){
                        let indx = (i + (i+6)) / 2;
                        if(indx == index)
                        {
                        let last = gameboard[indx];
                        if(last == player)
                            score = 6;
                        }
                        }
                    }
                
                    //Diagonals Space Between
                    // 0 x 8
                    // 2 x 6
                    // if((zero == eight || two == six) && four == player  && (zero == opponent || two == opponent))
                    //   score = 6;
                
                    return score;
                    }
                
                    return indexOfMove;
                }
                //Make the move after 1 second delay
                botTimeoutID = setTimeout( () =>{
                    events.emit('botMoveMade', bestMove);
                    if(!( ( players[0].isABot() || players[0].isAHardBot() ) && ( players[1].isABot() || players[1].isAHardBot() ) ) )
                        events.emit('isNotBotTurn', true);
                }, 1000);
            
        

    }

    const isGameOverToggle = (bol) =>{
        isGameOver = bol;
    }

    const moveSelector = (gameboard) =>{
        let players = GameBoard.getPlayers();

        if(botTimeoutID !== null)
            clearTimeout(botTimeoutID);

        events.emit('isNotBotTurn', true);

        let xCount = 0;
        let oCount = 0;
        let player = '';
        let opponent = '';
        
        let ctr = 0;
        while(ctr < 9){
            if(gameboard[ctr] == 'x')
                xCount++;
            if(gameboard[ctr] == 'o')
                oCount++;
            ctr++;
        }
        
        if(xCount == oCount){
            player = 'x';
            opponent = 'o';
        }else{
            player = 'o';
            opponent = 'x';
        }

        if(isGameOver && ( (player == 'x' && players[0].isAHardBot()) || (player == 'o' && players[1].isAHardBot()) ))
        {
            makeOptimizedMove(gameboard, player, opponent);
        }
        else{
            makeRandomMove(gameboard);
        }
    }

    events.on('gameOn', isGameOverToggle);
    events.on("gameOn", makeFirstMove);
    events.on('makeAMoveBot', moveSelector);
})();
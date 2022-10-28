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
        if(players.player1.isABot() && players.player2.isABot())
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
    if(name == "_BOT"){
        isBot = true;
    }
    const getName = () => name;
    const placeMarker = place =>{
        events.emit('moveMade', place);
    };
    const setPlayerNumber = (index) =>{
        this.playerNumber = index;
    }
    const isABot = () => isBot;
    
    const getPlayerNumber = () => playerNumber;
    return {getName, placeMarker, getPlayerNumber, isABot, playerNumber};
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
    const makeFirstMove = (bol) =>{
        let players = GameBoard.getPlayers();
        if(botTimeoutID !== null)
            clearTimeout(botTimeoutID);
        console.log(players);
        if(bol && players[0].isABot())
        {
            events.emit('isNotBotTurn', false);
            botTimeoutID = setTimeout( () =>{
                events.emit('botMoveMade', 4);
                if(!(players[0].isABot() && players[1].isABot())) 
                    events.emit('isNotBotTurn', true);
            }, 500);
            
        }
        
            
    };

    const makeRandomMove = (gameboard) => {
        let players = GameBoard.getPlayers();
        if(players[0].isABot() || players[1].isABot())
        {
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
                if(!(players[0].isABot() && players[1].isABot()))
                    events.emit('isNotBotTurn', true);
            }, 1000);
        }
    };


    events.on("gameOn", makeFirstMove);
    events.on('makeAMoveBot', makeRandomMove);
})();
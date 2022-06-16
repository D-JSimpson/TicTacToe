const GameBoard = (() =>{
    let gameboard = ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"];
    let players = {player1: "", player2: ""};
    let gameOn = false;
    const addPlayer = (player) => {
        if(players.player1 == ""){
            players.player1 = player;
            player.setPlayerNumber(1);
        }
        else if(players.player2 == ""){
            players.player2 = player;
            player.setPlayerNumber(2);
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
        if(gameboard[move] == "empty" && gameOn == true){
            gameboard[move] = marker;
            console.log(gameboard);
            events.emit('updateBoardDisplay', gameboard);
        }
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

    return{getPlayers};
})();

const Player = (name) => {
    this.playerNumber = "";
    const getName = () => name;
    const placeMarker = place =>{
        events.emit('moveMade', place);
    };
    const setPlayerNumber = (index) =>{
        this.playerNumber = index;
    }
    const getPlayerNumber = () => playerNumber;
    return {getName, setPlayerNumber, placeMarker, getPlayerNumber};
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
            events.emit("gameOn", true);
            events.emit('reset');
            events.emit('newGame');
        } else{
            events.emit("gameOn", false);
        }
    };
    const changeTurn = (noNeed) =>{
        if(currentTurn == players[0]){
            currentTurn = players[1];
            events.emit("turnChange", "o");
        }
        else{
            currentTurn = players[0];
            events.emit("turnChange", "x");
        }
    };
    const setTurn = (noNeed) => {
        players = GameBoard.getPlayers();
        currentTurn = players[0];
        events.emit("turnChange", "x");
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
        winPossiblities.forEach((winSet) =>{
            if(winSet == "xxx")
            {
                let players = GameBoard.getPlayers();
                events.emit('gameWon', players[0]);
                events.emit('gameOn', false);
            }
            if(winSet == "ooo")
            {
                let players = GameBoard.getPlayers();
                events.emit('gameWon', players[1]);
                events.emit('gameOn', false);
            }
        });
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
    };
    marks.forEach((item, index) =>{
        item.addEventListener('click', function(){
            events.emit('moveMade', index);
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
        JS.innerText = player.getName();
        TicTacToe.innerText = "Has Won!";
    };
    events.on('gameWon', displayWinner);
    events.on('updateBoardDisplay', updateBoardDisplay);
    events.on('gameOn', gameOnToggle);
    events.on('reset', deleteDisplay);

})();


const PlayerDisplay = (() =>{
    const addBtn = document.querySelector("#add-player");
    const nameBtn = document.querySelector("#name-input");
    const players = document.getElementById("players");
    addBtn.addEventListener("click", function(){
        let value = nameBtn.value;
        if(value !== ""){
            const newPlayer = Player(value);
            // GameBoard.addPlayer(newPlayer);
            events.emit("addPlayer", newPlayer);
            display();
        }
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
            // GameBoard.deletePlayer(li.player);
            events.emit('deletePlayer', li.player);
            display();
        });
    };
})();
const apiUrl = process.env.API_URL || 'https://hampong-backend.vercel.app';

export const createGame = (sets, startingPlayer, playerOne, playerTwo) => {
    // games... sets, startingPlayer, date, sourceIp
    
    return $.ajax({
        url: apiUrl+'/games',
        type: 'POST',
        data: {
            sets,
            startingPlayer,
            playerOne,
            playerTwo
        }
    });
}


export const getChoices = (profile) => {
    return $.ajax({
        url: apiUrl+'/profiles/'+profile._id+'/choice',
        type: 'GET'
    });
}

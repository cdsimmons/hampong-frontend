const apiUrl = process.env.API_URL || 'https://gift-recommender-backend.herokuapp.com';

export const createGame = (sets, startingPlayer) => {
    // games... sets, startingPlayer, date, sourceIp
    
    return $.ajax({
        url: apiUrl+'/games',
        type: 'POST',
        data: {
            sets,
            startingPlayer
        }
    });
}


export const getChoices = (profile) => {
    return $.ajax({
        url: apiUrl+'/profiles/'+profile._id+'/choice',
        type: 'GET'
    });
}

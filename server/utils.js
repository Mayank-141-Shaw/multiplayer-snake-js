module.exports = {
    makeid,
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var characterslength = characters.length;
    for (var i = 0; i< length; i++){
        result += characters.charAt(Math.floor(Math.random() * characterslength));
    }
    return result;
}
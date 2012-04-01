function getRandomNumber(maxvalue) {
    if (arguments.length < 1) {
        maxvalue = 10;
    }
    return Math.floor(Math.random() * (maxvalue + 1));
}

exports.generateQuestionId = function (usrId) {
    var newDate = new Date();
    return newDate.getTime() + usrId.toString();
};

exports.generateQuestionMessage = function () {
    var trigger = getRandomNumber(1);
    switch (trigger) {
        case 0:
            return getRandomNumber() + ' + ' + getRandomNumber();
            break;
        case 1:
            return getRandomNumber().toString() + ' * ' + getRandomNumber().toString();
            break;
        default:
            return '2+2';
            break;
    }
};

exports.generateVerification = function (quest) {
    var verification = eval(quest);
    console.log(verification);
    return verification;
};



var generatePropertiesFile = function(jsonUser) {
    var staticComment = '#Coding dojo client properties';
    var stringBuffer;


};

exports.generateZipPackage = function (userId, propertiesFilePath) {

};
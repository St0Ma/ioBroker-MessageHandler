/*******************************************************************************
 * MessageGlobal
 * ----------------------------------------------------
 * Protokollierung von Nachrichten für IOBroker.
 * Ermöglicht es Nachrichten global in einer Liste zu erfassen und nach Prioritäten visuell anzuzeigen.
 * ----------------------------------------------------
 * Autor: Github-Name: St0Ma ioBroker-Forum-Name: Tirador 
 * Source:  https://github.com/St0Ma/ioBroker-MessageHandler
 * Support: https://forum.iobroker.net/topic/32207/script-messagehandler-nachrichten-protokollieren-vis
 * ----------------------------------------------------
 * Change Log:
 *  0.3  - few code improvements
 *  0.2  - Initial Release
 * ---------------------------------------------------- 
 * (c) 2020 by Tirador, MIT License, no warranty, use on your own risc
 ******************************************************************************/

function postMessage(msgID,  msgText='', countEvents=0, msgHeader='') {
    var json = 
    {
        msgType: "INSERT",
        msgID: msgID,
        msgHeader: msgHeader,
        msgText: msgText,
        countEvents: countEvents
    };
    setState("0_userdata.0.messageHandler.newMessage", JSON.stringify(json), true);  
}


function removeMessage(msgID, msgText='') {
    var json = 
    {
        msgType: "DELETE",
        msgID: msgID,
        msgText: msgText
    };
    setState("0_userdata.0.messageHandler.newMessage", JSON.stringify(json), true);  
}


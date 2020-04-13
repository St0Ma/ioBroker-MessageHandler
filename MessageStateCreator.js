/*******************************************************************************
 * MessageStateCreator
 * ----------------------------------------------------
 * Ermöglicht die Überwachung von Datenpunkten und das Auslösen von Nachrichten
 * mit dem MessageHandler-Nachrichtensystem.
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
 ******************************************************************************


*******************************************************************************
 * Installation
*******************************************************************************

 1. Das Javascript "MessageGlobal" als globales Script installieren und starten.

 2. Den Javascript "MessageHandler" serverseitiges Script installieren und starten-5 Sek warten-stoppen-starten. 
 Beim 1.Start werden die notwendigen States unter STATE_PATH = '0_userdata.0.messageHandler.' 
 erzeugt. Erst beim 2.Start instanziiert das Script die Event-Handler und läuft dann.

 3. Das Javascript "MessageStateCreator" installieren und starten.

*******************************************************************************
 * Basis-Konfiguration
*******************************************************************************

Optional kann in der Funktion MessageHandler|doInit() eine Anpassung der KONFIGURATION vorgenommen werdne.

Zur Konfiguration sind zwei Schritte erforderlich:

1. Die Grundkonfiguration erfolgt über die Festlegung von MESSAGE-IDs (Nachrichten-Ids)
  im Javascript "MessageHandler".

2. Über das Javascript "MessageStateCreator" können Datenpunkte überwacht werden 
   und Nachrichten automatisiert ausgelöst werden. Die Konfiguration erfolgt hierfür im Javascript "MessageStateCreator".

/*******************************************************************************/

// ------------------------------------------------------------------------------------- 
// Konfiguration der zu überwachenden Datenpunkte mit Konfiguration der Nachrichten (MSG-IDs)
// ------------------------------------------------------------------------------------- 

/////////////////////
// Hier die einzelnen Nachrichten anlegen und einstellen.
// Im ersten Beispiel ist alles im Detail beschrieben.
/////////////////////

const MESSAGE_EVENTS = [


    // Anzahl geöffneter Fenster mit Räumen
    // Datenpunkte basieren auf Pitinis Fensterskript
    // GITHUB: https://github.com/Pittini/iobroker-Batterienauswertung
    // Forum IOBroker: https://forum.iobroker.net/topic/31676/vorlage-generische-batteriestands%C3%BCberwachung-vis-ausgabe
    {
		
		// msgID: Eindeutige msgID, die im Javascript "MessageHandler" definiert ist.
		//        Über die msgID erfolgt die Steuerung der 
		//        Priorität, Loglevel (INFO, WARNING, ALARM, ERROR),
		//        die Vorgabe des Icons, der Iconfarbe, ob eine Nachricht nur einmal geloggt wird uvm.
		
        msgID: 'WINDOW_ISOPEN_INFO', 
		
		// Datenpunkte, die als Trigger überwacht werden (auf die bei Veränderung von Werten reagiert wird).
		// Es kann ein Datenpunkt in der Notation '' angegeben werden, oder mehrere wie folgt im Beispiel in der Notation ['', '',...] 
		
        triggerDP: ['javascript.0.FensterUeberwachung.RoomsWithOpenWindows', 'javascript.0.FensterUeberwachung.WindowsOpen'],
		

		// postMsg: Nachricht nur erzeugen, wenn ein vorgegebener Datenpunkt einer bestimmten Bedingung entspricht.
		//          Im Beispiel müssen die Anzahl der geöffneten Fenster größer als 0 sein,
		//          damit die Nachricht "Fenster geöffnet" ausgelöst wird.
		//          
		//       dp: Datenpunkt dessen Wert der Bedingung entsprichen muss
		//       comp: Vergleichsoperator. Es sind folgende Operatoren erlaubt:
		//             == gleich
		//             != ungleich
		//             >= größer gleich
		//             <= kleiner gleich
		//             >  größer
		//             <  kleiner
		//       val: Wert
		//       Die Nachricht wird erzeugt, wenn die Bedingung "dp comp val" eintritt.
		
        postMsgDP: {dp:'javascript.0.FensterUeberwachung.WindowsOpen', comp: '>', val:0}, 
		
		
		// removeMsgDP: Nachricht entfernen, wenn ein vorgegebener Datenpunkt einer bestimmten Bedingung entspricht.
		//          Im Beispiel wird die Nachricht "Fenster geöffnet" entfernt, 
		//          wenn die Anzahl der geöffneten Fenster gleich 0 ist.
		//
		//       dp: Datenpunkt dessen Wert der Bedingung entsprichen muss
		//       comp: Vergleichsoperator. Es sind folgende Operatoren erlaubt:
		//             == gleich
		//             != ungleich
		//             >= größer gleich
		//             <= kleiner gleich
		//             >  größer
		//             <  kleiner
		//       val: Wert
		//       Die Nachricht wird entfernt, wenn die Bedingung "dp comp val" eintritt.
				
        removeMsgDP: {dp:'javascript.0.FensterUeberwachung.WindowsOpen', comp: '==', val:0}, // Nachricht enfernen, wenn die Bedingung eintritt
		
		// msgText_<Nr> : Diese Attribute bestimmen die Ausgabe des Nachrichtentextes.
		// 
		//                Es kann ein statischer Text ausgegeben werden durch das Attribut:
		//                Beispiel: 
		//                msgText_1: {text: 'Fenster ist geöffnet'},
		//        
		//                Der Wert eines Datenpunkts kann in die Fehlernachricht mit ausgegeben werden.
		//                Beispel: 
		//                msgText_2: {dp: 'javascript.0.FensterUeberwachung.RoomsWithOpenWindows'},
		// 
		//                Es können beliebig viele msgText_ Attribute (mit fortlaufender Nummer) 
		//                eingefügt werden (msgText_1, msgText_2, msgText_3, usw.).
		//                Der Nachrichtentext ergibt sich aus der Konkatenation aller einzelner Bausteine.
		
        msgText_1: {text: ''},
        msgText_2: {dp: 'javascript.0.FensterUeberwachung.RoomsWithOpenWindows'},
		
		
		// countEventsDP: Information wieviele Ereignisse für die Meldung eingetreten sind.
		//                Dieses Element ist optional.
		//                Die Anzahl wird über den vorgegebenen Datenpunkt ermittelt.
		// 
        //                Beispiele: Für das Beispiel werden die Anzahl der offenen Fenster ausgegeben.
		
        countEventsDP: 'javascript.0.FensterUeberwachung.WindowsOpen'
    },
    
    
    // Eigene Nachricht, wenn alle Fenster geschlossen sind (Nur INFO)
    // Datenpunkte basieren auf Pitinis Fensterskript
    // GITHUB: https://github.com/Pittini/iobroker-Batterienauswertung
    // Forum IOBroker: https://forum.iobroker.net/topic/31676/vorlage-generische-batteriestands%C3%BCberwachung-vis-ausgabe
    {
        msgID: 'WINDOW_ISCLOSED_INFO', 
        triggerDP: ['javascript.0.FensterUeberwachung.RoomsWithOpenWindows', 'javascript.0.FensterUeberwachung.WindowsOpen'],
        postMsgDP: {dp:'javascript.0.FensterUeberwachung.WindowsOpen', comp: '==', val:0},
        removeMsgDP: {dp:'javascript.0.FensterUeberwachung.WindowsOpen', comp: '>', val:0}, // Nachricht enfernen, wenn die Bedingung eintritt
        msgText_1: {text: ''},
        msgText_2: {dp: 'javascript.0.FensterUeberwachung.RoomsWithOpenWindows'},
        countEventsDP: 'javascript.0.FensterUeberwachung.WindowsOpen'
    },

    // Letzter Briefkasteneinwurf
    // Eine Nachricht wird nur ausgelöst, wenn der Sensor aktiviert wird
    {
        msgID: 'LAST_POSTENTRACE_INFO',
        triggerDP: 'deconz.0.Sensors.8.open',
        postMsgDP: {dp:'deconz.0.Sensors.8.open', comp: '==', val:true},
        msgText_1: {text: ''},
        countEventsDP: ''
    },    

    // Anzahl anwesender Personen mit Personenangabe
    // An- und Abwesenheitserkennung über TR-064-Community-Adapter (von Mic) 
    // (Quelle: https://github.com/Mic-M/iobroker.presence-script-for-tr-064-community-adapter)
    {
        msgID: 'PERSONS_AVAILABLE_INFO', 
        triggerDP: '0_userdata.0.Anwesenheit.Status.allPresentPersonsCount',
        postMsgDP: {dp:'0_userdata.0.Anwesenheit.Status.allPresentPersonsCount'},
        msgText_1: {dp: '0_userdata.0.Anwesenheit.Status.presentPersonsString'},
        countEventsDP: '0_userdata.0.Anwesenheit.Status.allPresentPersonsCount'
    },

    // Verpasster Anruf (des Tages)
    // Über TR-064-Community-Adapter
    {
        msgID: 'MISSED_CALLS', 
        triggerDP: 'tr-064.0.calllists.missed.count',
        postMsgDP: {dp:'tr-064.0.calllists.missed.count'},
        msgText_1: {text: 'Anzahl verpasster Anrufe: '},
        msgText_2: {dp: 'tr-064.0.calllists.missed.count'},
        countEventsDP: 'tr-064.0.calllists.missed.count'
    } ,

    // Corona-Statistics
    {
        msgID: 'CORONA_STATS_CASES', 
        triggerDP: ['coronavirus-statistics.0.Germany.cases', 'coronavirus-statistics.0.Germany.deaths'],
        postMsgDP: {dp:'coronavirus-statistics.0.Germany.cases'},
        msgText_1: {text: '☣ Bestätigt: '},
        msgText_2: {dp: 'coronavirus-statistics.0.Germany.cases'},
        msgText_3: {text: '</br>♱ Tote: '},
        msgText_4: {dp: 'coronavirus-statistics.0.Germany.deaths'},
        countEvents: 'coronavirus-statistics.0.Germany.deaths'
    },

    // Temperatur-Information
    // Außen und Innentemperatur
    {
        msgID: 'TEMPERATURE_INFO', 
        triggerDP: ['deconz.0.Sensors.18.temperature', 'deconz.0.Sensors.3.temperature'],
        postMsgDP: {dp:'deconz.0.Sensors.18.temperature'},
        msgText_1: {text: '🌐 '},
        msgText_2: {dp: 'deconz.0.Sensors.18.temperature'},
        msgText_3: {text: ' °C'},
        msgText_5: {text: '</br>🏠 '},
        msgText_6: {dp: 'deconz.0.Sensors.3.temperature'},
        msgText_7: {text: ' °C'},
        countEvents: ''
    },

    // Müllabholung
    // Nächster Mülltermin
    {
        msgID: 'NEXT_GARBAGE_INFO', 
        triggerDP: ['trashschedule.0.next.daysleft', 'trashschedule.0.next.types'],
        postMsgDP: {dp:'trashschedule.0.next.daysleft'},
        msgText_1: {text: ''},
        msgText_2: {dp: 'trashschedule.0.next.types'},
        msgText_3: {text: ' in '},
        msgText_4: {dp: 'trashschedule.0.next.daysleft'},
        msgText_5: {text: ' Tage(n)'},
        countEvents: 'trashschedule.0.next.daysleft'
    },
    
    // Wassersensor Werkzeugraum
    {
        msgID: 'WATER_ALARM', 
        triggerDP: 'deconz.0.Sensors.21.water',
        postMsgDP: {dp:'deconz.0.Sensors.21.water', comp: '==', val:true},
        //removeMsgDP: {dp:'deconz.0.Sensors.21.water', comp: '==', val:false}, // Nachricht wird zur Sicherheit nicht entfernt, falls der Sensor toggelt!
        msgText_1: {text: 'Wasseralarm im Werkzeugraum!'},
        countEventsDP: ''
    },

    // Wassersensor Waschraum
    {
        msgID: 'WATER_ALARM', 
        triggerDP: 'deconz.0.Sensors.34.water',
        postMsgDP: {dp:'deconz.0.Sensors.34.water', comp: '==', val:true},
        //removeMsgDP: {dp:'deconz.0.Sensors.34.water', comp: '==', val:false}, // Nachricht wird zur Sicherheit nicht entfernt, falls der Sensor toggelt!
        msgText_1: {text: 'Wasseralarm im Waschraum!'},
        countEventsDP: ''
    },

    // Wassersensor Küche
    {
        msgID: 'WATER_ALARM', 
        triggerDP: 'deconz.0.Sensors.6.water',
        postMsgDP: {dp:'deconz.0.Sensors.6.water', comp: '==', val:true},
        //removeMsgDP: {dp:'deconz.0.Sensors.6.water', comp: '==', val:false}, // Nachricht wird zur Sicherheit nicht entfernt, falls der Sensor toggelt!
        msgText_1: {text: 'Wasseralarm in der Küche!'},
        countEventsDP: ''
    },

    // Wassersensor großer Kellerraum
    {
        msgID: 'WATER_ALARM', 
        triggerDP: 'deconz.0.Sensors.7.water',
        postMsgDP: {dp:'deconz.0.Sensors.7.water', comp: '==', val:true},
        //removeMsgDP: {dp:'deconz.0.Sensors.7.water', comp: '==', val:false}, // Nachricht wird zur Sicherheit nicht entfernt, falls der Sensor toggelt!
        msgText_1: {text: 'Wasseralarm im großen Kellerraum!'},
        countEventsDP: ''
    },
    
 ];

// ------------------------------------------------------------------------------------- 
// Ab hier keine Konfiguration mehr durchführen!!!
// ------------------------------------------------------------------------------------- 

// ------------------------------------------------------------------------------------- 
// MessageStateCreator
// ------------------------------------------------------------------------------------- 

class MessageStateCreator {

    constructor() {
      this.init();
    }
    
    //
    init() {
        // const
        this.DEBUG      = false;
        this.VERSION    = '0.2/2020-04-04';
        this.NAME       = 'MessageStateCreator';

        // var
        this.installed = false;
        this.subscribers = [];
        this.schedulers = [];

    }
    
    // start the script/class
    start() {

        if(!this.validate()) {
            return;
        }

        if (this.doStart())
            this.log('script started');
    }
    
    // stop the script/class
    stop() {
        if (this.doStop()) {
            this.log('script stopped');
            for (let i=0; i<this.subscribers.length; i++) if (this.subscribers[i] !== undefined) unsubscribe( this.subscribers[i] );
            this.subscribers = [];
            for (let i=0; i<this.schedulers.length; i++) if (this.schedulers[i] !== undefined) clearSchedule( this.schedulers[i] );
            this.schedulers = [];
        }
    }
    

	// start the script/class
    doStart() {
 		
         for(const MsgConf of MESSAGE_EVENTS) {

            // We are allowing multiple trigger for one msgID.
            // triggerDP: [{dp: 'javascript.0.FensterUeberwachung.RoomsWithOpenWindows'}, {dp:'javascript.0.FensterUeberwachung.WindowsOpen'}],
            let triggerDPArray = [];
            if (typeof MsgConf.triggerDP == 'string') {
                // If we just have one sensor as string
                triggerDPArray.push(MsgConf.triggerDP);
            } else {
                triggerDPArray = MsgConf.triggerDP;
            }

            let first = true;
            
            for (const triggerDP of triggerDPArray) {

                if(first) {
                     // Mit Skriptstart die Nachrichten auslösen
                    this.createMessage(triggerDP);
                    first = false;
                }
                
                // subscriber erzeugen
                this.subscribers.push( on( triggerDP, obj => { this.onChangeDP(obj) } ));
            }

            let postMsgDP = MsgConf['postMsgDP'].dp;         
           
        }

        return true;
    }
    
	doStop() { return true; }

    // newMessage
    onChangeDP(obj) {

        if(this.DEBUG) {
            this.log("New Value from state:" + obj.id);
        }

        this.createMessage(obj.id);
    }  

	/*
    / Prüfung auf plausible Konfiguration
	*/
    validate() {
		
		/*
		msgID: 'WINDOW_ISOPEN_INFO', 
        triggerDP: ['javascript.0.FensterUeberwachung.RoomsWithOpenWindows', 'javascript.0.FensterUeberwachung.WindowsOpen'],
        postMsgDP: {dp:'javascript.0.FensterUeberwachung.WindowsOpen', comp: '>', val:0}, // Nachricht erzeugen, wenn der DP geändert wird und der Bedingung entspricht
        removeMsgDP: {dp:'javascript.0.FensterUeberwachung.WindowsOpen', comp: '==', val:0}, // Nachricht enfernen, wenn die Bedingung eintritt
        msgText_1: {text: ''},
        msgText_2: {dp: 'javascript.0.FensterUeberwachung.RoomsWithOpenWindows'},
        countEventsDP: 'javascript.0.FensterUeberwachung.WindowsOpen'
		*/
		
        let errorCount = 0;

        if (this.DEBUG) log('[DEBUG] ' + 'VALIDIERUNG *** START: Prüfung der Script-Konfiguration ***');

        for(const MsgConf of MESSAGE_EVENTS) {

			//-----------------------------------------------------
			// 1. Prüfe, ob msgID vorhanden ist
			// Beispiel: msgID: 'WINDOW_ISOPEN_INFO'
			//-----------------------------------------------------
			
			if (this.isLikeEmpty(MsgConf.msgID)) {
                this.logError('Attribut "msgID" wurde nicht gesetzt in Script-Konfiguration. Bitte Script-Konfiguration überprüfen.'); 
				errorCount++;
            }
            
			//-----------------------------------------------------			
			// 2. Prüfe, ob triggerDP vorhanden ist		
			// Beispiel: triggerDP: ['javascript.0.FensterUeberwachung.RoomsWithOpenWindows', 'javascript.0.FensterUeberwachung.WindowsOpen'],
			//-----------------------------------------------------
			
            if (this.isLikeEmpty(MsgConf.triggerDP)) {
                this.logError('msgID: [' + MsgConf.msgID + '] Attribut: [triggerDP] wurde nicht gesetzt in Script-Konfiguration! Bitte Script-Konfiguration überprüfen.');
                errorCount++;
            }

            // We are allowing multiple trigger for one msgID.
            // triggerDP: ['javascript.0.FensterUeberwachung.RoomsWithOpenWindows', 'javascript.0.FensterUeberwachung.WindowsOpen'],
            let triggerDPArray = [];
            if (typeof MsgConf.triggerDP == 'string') {
                // If we just have one sensor as string
                triggerDPArray.push(MsgConf.triggerDP);
            } else {
                triggerDPArray = MsgConf.triggerDP;
            }

			// Erweiterte Prüfung, ob die trigger-Datenpunkte vorhanden sind
            for (const triggerDP of triggerDPArray) {
				if( this.isLikeEmpty(triggerDP)) { 
					if(!this.existState(triggerDP)) {
                        this.logError('msgID: [' + MsgConf.msgID + '] Attribut: [triggerDP] Datenpunkt: [' + triggerDP + '] existiert nicht! Bitte Script-Konfiguration überprüfen.');
						errorCount++;
					}
				}
			}
			
			//-----------------------------------------------------
			// 3. Prüfe, ob postMsgDP vorhanden ist			
			// Beispiel: postMsgDP: {dp:'javascript.0.FensterUeberwachung.WindowsOpen', comp: '>', val:0}, // Nachricht erzeugen, wenn der DP geändert wird und der Bedingung entspricht
			//-----------------------------------------------------
			
			errorCount += this.checkField(MsgConf, 'postMsgDP');

              
	  		//-----------------------------------------------------
			// 4. Prüfe, ob msgText vorhanden ist			
			// Beispiel:
			// msgText_1: {text: ''},
			// msgText_2: {dp: 'javascript.0.FensterUeberwachung.RoomsWithOpenWindows'},

			//-----------------------------------------------------

            let msgText = '';
                    

            let MSGTEXT_KEYS = (Object.keys(MsgConf).filter(str => str.includes('msgText_'))); // gibt alle Keys mit 'msgText_' als Array zurück, also z.B. ['msgText_1','msgText_2']

            if (this.isLikeEmpty(MSGTEXT_KEYS)) {
				this.logWarn('msgID: [' + MsgConf.msgID + '] Es wurde kein Nachrichtentext definiert (msgText_1, etc.). Bitte Script-Konfiguration überprüfen.');
				errorCount++;
            } else {

                for (const MSGTEXT_KEY of MSGTEXT_KEYS) {
					let dp = MsgConf[MSGTEXT_KEY].dp;                    
					
					if( ! this.isLikeEmpty(dp)) { 
						if(! this.existState(dp)) {
                            this.logError('msgID: [' + MsgConf.msgID + '] Attribut: [' + MSGTEXT_KEY + '] Datenpunkt: [' + dp + '] existiert nicht! Bitte Script-Konfiguration überprüfen.');
						}
					} 
                            
					let text = MsgConf[MSGTEXT_KEY].text;                    
					if( this.isLikeEmpty(text)  ) {
						//if (this.DEBUG) log('[DEBUG] VALIDIERUNG ' +  MsgConf.msgID + ': In [' + MSGTEXT_KEY + '] wurde kein gültiger Text definiert .');
                    }
                }
			}
			
			//-----------------------------------------------------
			// 5. Prüfe, ob countEventsDP vorhanden ist
			// Beispiel:
            // countEventsDP: 'javascript.0.FensterUeberwachung.WindowsOpen'
			//-----------------------------------------------------
            
			let countEventsDP = 0;
			if(MsgConf.countEventsDP != undefined && ! this.isLikeEmpty(MsgConf.countEventsDP) ) {
				if(! this.existState(MsgConf.countEventsDP)) {
                    this.logError('msgID: [' + MsgConf.msgID + '] Attribut: [countEventsDP] Datenpunkt: [' + MsgConf.countEventsDP  + '] existiert nicht! Bitte Script-Konfiguration überprüfen.');
				}
			}

                            
			errorCount += this.checkField(MsgConf, 'removeMsgDP');

        }	

        if (errorCount == 0) {
            if (this.DEBUG) this.log('[DEBUG] ' + 'VALIDIERUNG *** ENDE: Prüfung der Script-Konfiguration, Ergebnis: keine Fehler ***');
            return true;
        } else {
            this.logError('Insgesamt ' + errorCount + ' Fehler in der Script-Konfiguration gefunden. Daher wird abgebrochen und das Script nicht weiter ausgeführt.');
            return false;
        }
        
    } 

	// Hilfsfunktion zum Prüfen von Feldern
	checkField(MsgConf, field) {
		
		let errorCount = 0;
		
		if (this.isLikeEmpty(MsgConf[field])) {
			if(field == 'postMsgDP') {
                this.log('HINWEIS: msgID: [' + MsgConf.msgID + '] Attribut: [' + field + ']  wurde nicht gesetzt in Script-Konfiguration');
            }
			//errorCount++;
            return errorCount;
		}

		// 3.a) Prüfung [postMsgDp].dp
		let postMsgDP = MsgConf[field].dp;  // VOrher MsgConf['postMsgDP'].dp;

		if( this.isLikeEmpty(postMsgDP)) { 
			if(!this.existState(postMsgDP)) {
                this.logError('msgID: [' + MsgConf.msgID + '] Attribut: [' + field + '] Datenpunkt: [' + postMsgDP + '] existiert nicht!');
				errorCount++;
			}
		} 
		
		// 3.b) Prüfung [postMsgDp].comp

		let condDP = MsgConf[field].comp;   
		if( condDP == undefined) {
			condDP = '==';
		}
		if( this.isLikeEmpty(condDP)) { 
			this.logError('msgID[' + MsgConf.msgID + '] Attribut: [' + field + '] Operator ' + condDP + ' existiert nicht!');
			errorCount++;
		}
		
		if( ! ( condDP == '!=' || condDP == '==' || condDP == '>' || condDP == '<' || condDP == '<=' || condDP == '>=' ) )
		{
			this.logError('msgID: [' + MsgConf.msgID + '] Attribut: [' + field + '] Operator ' + condDP + ' existiert nicht!');
			errorCount++;
		}
		
		return errorCount;
	}

    // createMessage
    createMessage(objID) {

        for(const MsgConf of MESSAGE_EVENTS) {
               
            // We are allowing multiple trigger for one msgID.
            // triggerDP: [{dp: 'javascript.0.FensterUeberwachung.RoomsWithOpenWindows'}, {dp:'javascript.0.FensterUeberwachung.WindowsOpen'}],
            let triggerDPArray = [];
            if (typeof MsgConf.triggerDP == 'string') {
                // If we just have one sensor as string
                triggerDPArray.push(MsgConf.triggerDP);
            } else {
                triggerDPArray = MsgConf.triggerDP;
            }

            for (const triggerDP of triggerDPArray) {

				if(triggerDP == objID) {

					if(this.DEBUG) this.log("Trigger ausgelöst:" + triggerDP);               

					let createMsg = this.checkCondition(MsgConf, 'postMsgDP');
					
					let removeMsg = this.checkCondition(MsgConf, 'removeMsgDP');

					if(createMsg || removeMsg) {

						// erzeugen Nachrichtentext aus Vorgabe und Datenpunkten
						let msgText = '';

						let MSGTEXT_KEYS = (Object.keys(MsgConf).filter(str => str.includes('msgText_'))); // gibt alle Keys mit 'msgText_' als Array zurück, also z.B. ['msgText_1','msgText_2']

						if (this.isLikeEmpty(MSGTEXT_KEYS)) {
							this.logWarn('Konfiguration der Textausgabe ' + MsgConf.msgID + 'Es wurde kein Nachrichtentext definiert (msgText_1, etc.). Bitte Script-Konfiguration überprüfen.');
						} else {
							for (const MSGTEXT_KEY of MSGTEXT_KEYS) {
								let dp = MsgConf[MSGTEXT_KEY].dp;                    
								if( ! this.isLikeEmpty(dp)) { // FIXME Auf nicht existierenden DP prüfen!
									if(this.existState(dp)) {
										msgText += getState(dp).val;
										
									} else {
									this.log('Datenpunkt ' + dp + ' existiert nicht! [' + MsgConf.msgID + '].');
									}
								} 
								
								let text = MsgConf[MSGTEXT_KEY].text;                    
								if( this.isLikeEmpty(text)  ) { // FIXME Auf nicht existierenden DP prüfen!
									//if (DEBUG) log('[DEBUG] VALIDIERUNG ' + LPCONF.name + ': In [' + LP_PERIOD_KEY + '] wurden keine Sekunden zum Ausschalten definiert oder auf 0 gesetzt, daher wird nicht automatisch abgeschaltet.');
								} else {
									msgText += text;
								} 

							}
						}
					
						// erzeugen Anzahl
						let countEventsDP = 0;
						if(MsgConf.countEventsDP != undefined && MsgConf.countEventsDP != '') {
							countEventsDP = getState(MsgConf.countEventsDP).val;
						}

						if(createMsg) {
							this.log("postMessage(" + MsgConf.msgID + ", " + msgText + ", " + countEventsDP + ")");
							// Erzeugen der Nachricht über MessageHandler
							postMessage(MsgConf.msgID, msgText, countEventsDP); 
						}

						if(removeMsg) {
							this.log("removeMessage(" + MsgConf.msgID + ", " + msgText + ")");
							// Entfernen der Nachricht über MessageHandler
							removeMessage(MsgConf.msgID, msgText); 

						}
                        
                        if(createMsg && removeMsg) {
                            this.logError('msgID: [' + MsgConf.msgID + '] Die Nachricht mit Nachrichtentext "' + msgText + '" wird gleichzeitig erzeugt und entfernt. Bitte Skript-Konfiguration prüfen!' )
                        }
					}
				} // if
			} // for
        } // for
    } 
	
	checkCondition(MsgConf, field) {

   		if (this.isLikeEmpty(MsgConf[field])) {
			// if(this.DEBUG) this.logWarn(field + ' wurde nicht gesetzt in Script-Konfiguration.');
			// Wenn postMsgDP nicht definiert, Nachricht erzeugen
			// Wenn removeMsgDP nicht definiert ist, wird die Nachricht NICHT gelöscht
			if(field == 'postMsgDP') {
                return true;
            } else if(field == 'removeMsgDP') {
                return false;
            }
            
		}
		
		let dp = MsgConf[field].dp;

		let createMsg = false;

		let comp = MsgConf[field].comp;   

		if( this.isLikeEmpty(comp)) {
			comp = '==';
		}

		let val = MsgConf[field].val;   

 
		if( val == undefined) {
			createMsg = true;
		} else if(comp == '==') {
			if( getState(dp).val == val) {
				createMsg = true;
			}
		} else if(comp == '!=') {
			if( getState(dp).val !== val) {
				createMsg = true;
			}
		} else if(comp == '>') {
			if( getState(dp).val > val) {
				createMsg = true;
			}
		} else if(comp == '<') {
			if( getState(dp).val < val) {
				createMsg = true;
			}
		} else if(comp == '>=') {
			if( getState(dp).val >= val) {
				createMsg = true;
			}
		} else if(comp == '<=') {
			if( getState(dp).val <= val) {
				createMsg = true;
			}
		}

        if(this.DEBUG) this.log('msgID: [' + MsgConf.msgID + '] Datenpunkt: [' + field + '] dp: [' + dp + '] State dp.val: [' + getState(dp).val + '] comp: [' + comp + '] val: [' + val + '] createMsg:' + createMsg);

		
		return createMsg;
	}




        
    //------------------------------------------------------------------------------
    // --------------------- helper functions 
    //------------------------------------------------------------------------------

    logDebug(msg) { if (this.DEBUG) console.log('['+this.NAME+'] '+msg); }
    log(msg) { console.log('['+this.NAME+'] '+msg); }
    logWarn(msg) { console.warn('['+this.NAME+'] '+msg); }
    logError(msg) { console.error('['+this.NAME+'] '+msg); }
    
    // über den $-Operator nachsehen, ob der state bereits vorhanden ist
    // getState().notExists geht auch, erzeugt aber Warnmeldungen!
    existState(id) {
        return ( $(id).length==0?false:true);
    }


    /**
     * Checks if Array or String is not undefined, null or empty.
     * 08-Sep-2019: added check for [ and ] to also catch arrays with empty strings.
     * @param inputVar - Input Array or String, Number, etc.
     * @return true if it is undefined/null/empty, false if it contains value(s)
     * Array or String containing just whitespaces or >'< or >"< or >[< or >]< is considered empty
     */
    isLikeEmpty(inputVar) {
        if (typeof inputVar !== 'undefined' && inputVar !== null) {
            let strTemp = JSON.stringify(inputVar);
            strTemp = strTemp.replace(/\s+/g, ''); // remove all whitespaces
            strTemp = strTemp.replace(/\"+/g, "");  // remove all >"<
            strTemp = strTemp.replace(/\'+/g, "");  // remove all >'<
            strTemp = strTemp.replace(/\[+/g, "");  // remove all >[<
            strTemp = strTemp.replace(/\]+/g, "");  // remove all >]<
            if (strTemp !== '') {
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }
    

}   
    
// create instance and start
var messageStateCreator = new MessageStateCreator();
messageStateCreator.start();



// on script stop, stop instance too
onStop(function () { 
	messageStateCreator.stop(); 
}, 1000 );
    
    

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Platform} from 'ionic-angular';
import { SQLite,SQLiteObject } from '@ionic-native/sqlite';
import { Geolocation } from '@ionic-native/geolocation';
import {LatLng} from '@ionic-native/google-maps';

/*
  Generated class for the Data provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Data {
	public myLocation:LatLng;
	watch:any;	
	public geolocation:Geolocation;
	private sqlite: SQLite;
	public items: Array<{id: number, name: string}> ;
	public clients: Array<{id: number, name: string, email: string, adress: string, latitude: number, longtitude: number, phonenumber: string, favourite: boolean, distance:number}> = null;
	public cloudclients: any;
	private http:any;
	constructor(public platform: Platform, public chttp: Http) { 
		this.geolocation = new Geolocation;
		this.http= this.chttp;
		
		
		this.myLocation=new LatLng(35.514019,24.020329);
		
		
		//Database
		this.sqlite=new SQLite();
		this.platform.ready().then(() => {
		
			this.sqlite.create({
			  name: 'data.db',
			  location: 'default' // the location field is required
			  //iosDatabaseLocation needed for iOs devices
			  
			}).then((db: SQLiteObject) => {
				this.getClientNames(db).
				then(()=>{this.closeDB(db);});
			});
			
			this.geObserve();
		});	
		
	}

	filterItems(searchTerm){
		return this.items.filter((item) => {
            return item.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
        });       
  
    }
	
	
	createTable(){
		return new Promise((resolve, reject) => {
			//alert("Updating Database...");
			//open database
			this.sqlite.create({
			  name: 'data.db',
			  location: 'default' // the location field is required
			  //iosDatabaseLocation needed for iOs devices
			  
			}).then((db: SQLiteObject) => {
					//create table if not exists 
					db.executeSql('CREATE TABLE IF NOT EXISTS Clients(id INTEGER PRIMARY KEY, name VARCHAR(32), email VARCHAR(32), adress VARCHAR(32), latitude DECIMAL(10,7), longtitude DECIMAL(10,7), number VARCHAR(32),favourite BOOLEAN);', {})////(6,4)->(9,7)
					.then(() => {
						console.log("Table created!");
						//Clear table and insert values
						db.executeSql('DELETE FROM Clients;', {})
						.then(() => {
							console.log("Table clear! /n Inserting Data..");
							//insert Client Data
							this.checkUpdate().then(()=>{
								
								for(let pop in this.cloudclients) {
									this.insertClient(db,
										this.cloudclients[pop].id,
										this.cloudclients[pop].name,
										this.cloudclients[pop].email,
										this.cloudclients[pop].adress,
										this.cloudclients[pop].latitude,
										this.cloudclients[pop].longtitude,
										this.cloudclients[pop].number,
										this.cloudclients[pop].favourite
									
									);
								}						
								this.getClientNames(db).then(()=>{ this.closeDB(db); resolve();});
							
							});
							
						}, (error)=>{
							console.log("Unable to clear table: "+error);
							reject(error);
						});
					}, (err) => {
						console.log('Unable to to create  table: ', err);
						reject(err);
					});
					

			}, (err) => {
			  console.error('Unable to open database: ', err);
			});
				
		});
	}	
	insertClient(db,id,name,email,adress,latitude,longtitude,phonenumber,favourite){
		db.executeSql('INSERT  INTO Clients (id,name,email,adress,latitude,longtitude,number,favourite) VALUES (?,?,?,?,?,?,?,?)' ,[id,name,email,adress,latitude,longtitude,phonenumber,favourite], {})
		.then(() => {
			console.log("Inserted Client "+id+","+name+","+email+","+adress+","+latitude+","+longtitude+","+phonenumber+","+favourite);                        
		}, (error)=>{
			console.log("Unable to insert client : "+error);
		});
	}	
    
	

		
	closeDB(db) {
        db.close(function() {
            console.log("DB closed!");
        }, function (error) {
            console.log("Error closing DB:" + error.message);
        });
    }
	
	getClientNames(db){
		
		return new Promise((resolve, reject) => {
			
			
				console.log(" client names bitch!!");
				db.executeSql("SELECT id,name FROM Clients WHERE 1=1", [])
				.then((resultSet) => {
					this.items = [];
					console.log("client names length:"+ resultSet.rows.length);
					if(resultSet.rows.length > 0) {
						
						for(let x = 0; x < resultSet.rows.length; x++) {
							//console.log("pushing client"+ resultSet.rows.item(x).id);
							this.items.push({
								id:  resultSet.rows.item(x).id,
								name:  resultSet.rows.item(x).name
							});	
						}
					}
					console.log("Got client names bitch!!this.items:  "+this.items.length);
					resolve();
				}, (error)=>{
					console.log("Error getting client names!! , error :"+error);
					reject(error);
				});
		
		});
		
	}	
	
	
	queryListExecuter(query){
		
		return new Promise((resolve, reject) => {
	
			this.sqlite.create({
			  name: 'data.db',
			  location: 'default' 
			  
			}).then((db: SQLiteObject) => {
				db.executeSql(query, [])
				.then((resultSet) => {
					this.clients = [];
					console.log("resultSet.rows.length: "+ resultSet.rows.length);

					if(resultSet.rows.length > 0) {
						for(let x = 0; x < resultSet.rows.length; x++) {
						
							//console.log("item "+resultSet.rows.item(x).name);
 							
							this.clients.push({
								id:  resultSet.rows.item(x).id,
								name:  resultSet.rows.item(x).name,
								email: resultSet.rows.item(x).email,
								adress: resultSet.rows.item(x).adress,
								latitude: resultSet.rows.item(x).latitude,
								longtitude: resultSet.rows.item(x).longtitude,
								phonenumber: resultSet.rows.item(x).number,
								favourite: resultSet.rows.item(x).favourite,
								distance: 100000000
							});	 
						}
					}
					console.log("queryExecuter Resolved! query:"+query);
					this.closeDB(db);
					this.load();
					resolve();
				}, (error)=>{
					console.log("Unable to exequte "+query+" , error :"+error);
					reject(error);
				});
			},(err) => {
			  console.error('Unable to open database: ', err);
			  reject(err);
			});
		
		});
		
	}	
	
	
	checkUpdate(){
		return new Promise((resolve, reject) => {
			this.http.get('https://firebasestorage.googleapis.com/v0/b/test-8899f.appspot.com/o/MOCK_DATA.json?alt=media&token=969993d7-9f65-4bd9-a8a0-cf932391d555').map(res => res.json())
			.subscribe(datares => {
				
				this.cloudclients = datares;
				console.log("http get resolve");
				resolve();
			},err => {
			console.log("Oops!");
			reject(err);
			});
			
		});
	}

	
	//   location shit
	
		geObserve(){
		
   		this.watch = this.geolocation.watchPosition();
		this.watch.subscribe((pos) => {
			// create LatLng object

			this.myLocation = new LatLng(pos.coords.latitude,pos.coords.longitude);
			if (this.clients != null){
				this.load();
			}
			//alert("In observable");
			 // move the map's camera to position
/* 			this.gmap.animateCamera({
			  'target': this.myLocation,
			  'tilt': 30,
			  'zoom': 18,
			  'bearing': 140
			});
		
			this.myMarker.setPosition(this.myLocation);
			//this.myMarker.showInfoWindow(); */
		});		
	}
	
	
	load(){
 
/*         if(this.clients){
            return Promise.resolve(this.clients);
        }
  */
        return new Promise(resolve => {
			console.log("|");
			this.clients = this.applyHaversine(this.clients);

			this.clients.sort((locationA, locationB) => {
				return locationA.distance - locationB.distance;
			});
			//for (let ff=0;ff<this.clients.length;ff++){console.log("distance ="+this.clients[ff].distance);}
			resolve(this.clients);
           
        });
 
    }
 
    applyHaversine(locations){
 
        locations.map((location) => {
			//console.log("lat "+location.latitude+"lng"+location.longitude);
            let placeLocation = {
                lat: location.latitude,
                lng: location.longtitude
            };
 
            location.distance = this.getDistanceBetweenPoints(
				this.myLocation,
                placeLocation,
                'km'
            ).toFixed(2);
        });
 
        return locations;
    }
 
    getDistanceBetweenPoints(start, end, units){
 
        let earthRadius = {
            miles: 3958.8,
            km: 6371
        };
 
        let R = earthRadius[units || 'km'];
        let lat1 = start.lat;
        let lon1 = start.lng;
        let lat2 = end.lat;
        let lon2 = end.lng;
 
        let dLat = this.toRad((lat2 - lat1));
        let dLon = this.toRad((lon2 - lon1));
        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d = R * c;
 
        return d;
 
    }
 
    toRad(x){
        return x * Math.PI / 180;
    }

	
	
}
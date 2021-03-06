import { Component } from '@angular/core';
import { NavController,NavParams,LoadingController} from 'ionic-angular';
import {GoogleMap, GoogleMapsEvent, LatLng,MarkerOptions,Marker} from '@ionic-native/google-maps';
import { Data } from '../../providers/data';
import 'rxjs/add/operator/map';


@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})



export class AboutPage {
	myMarker:Marker;
	testMarker:Array<Marker>;
	gmap:GoogleMap;
	listOrMap: string;
	element:HTMLElement;
	items:  Array<Object>;
	loading : any;
	
	constructor(public navCtrl: NavController,public navParams: NavParams,public dataService: Data,public loadingCtrl: LoadingController) {
		this.listOrMap = "list";
		this.testMarker=[];
		this.presentLoadingDefault();
		if (this.dataService.clients == null) {console.log("in");this.dataService.queryListExecuter('SELECT * FROM Clients WHERE id < 10');}
	}

	// Load map only after view is initialized
	ngAfterViewInit() {
		console.log("ngAfterViewInit()");
	}
	
	
	////////////   onSegmentChange($event)    /////////////////////////////////////////////
	onSegmentChange(event){
		setTimeout(()=>{ 
			this.element = document.getElementById('map');		
			console.log("--- delay 1 ---");
			if (event.value == "map"){
				this.loading.present();
				this.loadMap();
			}	
		}, 1);
	}
	
	
////////LOADING         ////////////////////////////////////////////	
	presentLoadingDefault() {
	  this.loading = this.loadingCtrl.create({
		content: 'Please wait...'
	  });
	}
/////////////////////////////////     loadMap()             ///////////////////////////////////////////////
	
	
	loadMap() {

		//this.element = document.getElementById('map');		

		setTimeout(()=>{ 
			console.log("--- delay 2 ---");	
		
				this.gmap = new GoogleMap(this.element);


					this.gmap.one(GoogleMapsEvent.MAP_READY).then(() => {
						
					 // move the map's camera to position
						this.gmap.animateCamera({
						  'target': this.dataService.myLocation,
						  'tilt': 30,
						  'zoom': 18,
						  'bearing': 140
						});						
							
						
						let myMarkerOptions: MarkerOptions = {
							position: this.dataService.myLocation,
							title: 'You are here!'
						};
						
						this.gmap.addMarker(myMarkerOptions).then((marker)=>{
							this.myMarker = marker;
							this.myMarker.showInfoWindow();
						}).then(()=>{
							this.loading.dismiss();
							this.afterMapLoad();
						});						
							
					
						
					});
		}, 1);
	}

	clientMarkers(){
		for(let kota = 0; kota < this.dataService.clients.length; kota++){
			if (this.testMarker.length > kota){
					console.log('remove');
					this.testMarker[kota].remove();
				
			}
			let testMarkerOptions: MarkerOptions = {
				position: new LatLng(this.dataService.clients[kota].latitude,this.dataService.clients[kota].longtitude),
				title: this.dataService.clients[kota].name
			};
			
			this.gmap.addMarker(testMarkerOptions).then((marker)=>{
				this.testMarker[kota] = marker;
			});				
		}							
	}

///////////////////////////////////////   geObserve()         /////////////////////////////////////////////////	
	afterMapLoad(){
		this.dataService.watch.subscribe(() => {
			
			
			 // move the map's camera to position
 			this.gmap.animateCamera({
			  'target': this.dataService.myLocation,
			  'tilt': 30,
			  'zoom': 18,
			  'bearing': 140
			});
		
			this.myMarker.setPosition(this.dataService.myLocation);
			//this.myMarker.showInfoWindow(); 
			
			
			if(this.testMarker.length < this.dataService.clients.length){this.clientMarkers();}
			

		});		
	}

	itemTapped(event, item) {
		this.dataService.selectedItem = item;
		console.log("item name:"+this.dataService.selectedItem.name);
		this.navCtrl.parent.select(2);	
	}	




	
}
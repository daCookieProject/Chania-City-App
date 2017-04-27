import { Component } from '@angular/core';
import { Data } from '../../providers/data';
import { NavController , LoadingController} from 'ionic-angular';
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
	
	
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
	
    searchTerm: string = '';
	searchControl: FormControl;
    items:  Array<Object>;
    searching: any = false;
    suggestOrNot: any = true;
	loading:any;
	
    constructor(public navCtrl: NavController, public dataService: Data,public loadingCtrl: LoadingController) {
		this.searchControl = new FormControl();
		this.presentLoadingDefault();
    }

    ngAfterViewInit() {
		console.log("ngAfterViewInit()");
        //Wait for more input-Avoid spam call
        this.searchControl.valueChanges.debounceTime(900)
        .subscribe(search => {
            this.searching = false;
            this.setFilteredItems();
        });
    } 

	testQuery1(){
			let query="SELECT * FROM Clients";
			this.dataService.queryListExecuter(query).then(()=>{
            console.log("this.items.length:"+ this.dataService.items.length);
            console.log("this.clients.length:"+ this.dataService.clients.length);
			this.navCtrl.parent.select(1);
        });
    }
    
    testQuery2(){
			let query="SELECT * FROM Clients WHERE favourite = 'true'";
			this.dataService.queryListExecuter(query).then(()=>{
			console.log("this.items.length:"+ this.dataService.items.length);
            console.log("this.clients.length:"+ this.dataService.clients.length);
            this.navCtrl.parent.select(1);
        });
    }
	refresh() {
		this.loading.present();
		this.dataService.createTable().then(()=>{this.loading.dismiss();});
	}
		
	presentLoadingDefault() {
	  this.loading = this.loadingCtrl.create({
		content: 'Please wait...'
	  });
	}
	
    onSearchInput(){	
        this.searching = true;
        this.suggestOrNot = true;
    }
	
	setFilteredItems() {
       if (this.searchTerm == '' || this.suggestOrNot == false){
           this.items = null;
           this.searching = false;
       }else{
           this.items = this.dataService.filterItems(this.searchTerm);
       }
    }
	
    //on click from suggestions
    itemSelected(item){
        console.log("Item clicked! \n item id: "+item.id);
        this.suggestOrNot = false;
    }	
	
}

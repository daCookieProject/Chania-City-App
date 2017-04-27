import { Component } from '@angular/core';
import { Data } from '../../providers/data';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

	
	  constructor(public navCtrl: NavController,public dataService: Data) {
			console.log("item name:"+this.dataService.selectedItem.name);
	  }

}

import { Component } from '@angular/core';
import { Service } from '../../services/service';

@Component({
  selector: 'app-postcoments',
  imports: [],
  providers:[Service],
  templateUrl: './postcoments.html',
  styleUrl: './postcoments.css'
})
export class Postcoments {
  constructor(private service:Service){
    console.log(service)
  }
}

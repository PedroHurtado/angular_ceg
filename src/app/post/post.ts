import { Component } from '@angular/core';
import { Postcoments } from './postcoments/postcoments';
import { Service } from '../services/service';

@Component({
  selector: 'app-post',
  imports: [Postcoments],
  templateUrl: './post.html',
  styleUrl: './post.css'
})
export class Post {
    constructor(private service:Service){
      console.log(service)
    }
    elements:number [] = [...Array(100).keys()].map(i => i + 1);
}

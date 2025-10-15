import { Component } from '@angular/core';
import { Postcoments } from './postcoments/postcoments';

@Component({
  selector: 'app-post',
  imports: [Postcoments],
  templateUrl: './post.html',
  styleUrl: './post.css'
})
export class Post {
    elements:number [] = [...Array(100).keys()].map(i => i + 1);
}

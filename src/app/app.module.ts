import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PostComponent } from './post/components/post/post.component';
import { CommentComponent } from './post/components/comment/comment.component';

@NgModule({
  declarations: [AppComponent, PostComponent, CommentComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule, // <-- Include module in our AppModules
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import {
  PlaytimeService,
  PlaygroundService,
  CreatePlaytimeDto,
  Playground
} from '../../../shared';
import { PlaytimeFormComponent } from '../playtime-form/playtime-form.component';

@Component({
  selector: 'app-playtime-form-page',
  standalone: true,
  imports: [
    CommonModule,
    PlaytimeFormComponent
  ],
  templateUrl: './playtime-form-page.component.html',
  styleUrl: './playtime-form-page.component.scss'
})
export class PlaytimeFormPageComponent implements OnInit {
  playground: Playground | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private playtimeService: PlaytimeService,
    private playgroundService: PlaygroundService
  ) {}

  ngOnInit(): void {
    const playgroundId = this.route.snapshot.paramMap.get('id');
    if (playgroundId) {
      this.playgroundService.getPlaygrounds().pipe(
        take(1)
      ).subscribe(playgrounds => {
        this.playground = playgrounds.find(p => p.id === playgroundId) || null;
      });
    }
  }

  onFormSubmit(playtimeDto: CreatePlaytimeDto): void {
    this.playtimeService.createPlaytime(playtimeDto).pipe(
      take(1)
    ).subscribe({
      next: () => {
        // Navigate back to playground detail page
        this.router.navigate(['/playground', this.playground!.id]);
      },
      error: (error) => {
        console.error('Error creating playtime:', error);
        alert('Leikkiajan luominen epäonnistui. Yritä uudelleen.');
      }
    });
  }

  onFormCancel(): void {
    if (this.playground) {
      this.router.navigate(['/playground', this.playground.id]);
    } else {
      this.router.navigate(['/map']);
    }
  }
}

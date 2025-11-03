import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.landing-title')?.textContent).toContain('Kaveritutka');
  });

  it('should have two jumbotron links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const jumbotronCards = compiled.querySelectorAll('.jumbotron-card');
    expect(jumbotronCards.length).toBe(2);
  });

  it('should have "Leikkimään!" link to map', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const mapLink = Array.from(compiled.querySelectorAll('.jumbotron-card')).find(
      card => card.textContent?.includes('Leikkimään!')
    ) as HTMLAnchorElement;
    expect(mapLink).toBeTruthy();
    expect(mapLink.getAttribute('href')).toBe('/map');
  });

  it('should have "Kaverihaku" link to friend-requests', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const friendRequestsLink = Array.from(compiled.querySelectorAll('.jumbotron-card')).find(
      card => card.textContent?.includes('Kaverihaku')
    ) as HTMLAnchorElement;
    expect(friendRequestsLink).toBeTruthy();
    expect(friendRequestsLink.getAttribute('href')).toBe('/friend-requests');
  });
});

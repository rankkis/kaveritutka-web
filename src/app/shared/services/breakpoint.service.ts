import { Injectable } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

/**
 * Breakpoint sizes following Material Design guidelines
 * XS: 0-599px (phones)
 * S: 600-959px (tablets portrait)
 * M: 960-1279px (tablets landscape, small desktops)
 * L: 1280-1919px (desktops)
 * XL: 1920px+ (large desktops)
 */
export type BreakpointSize = 'xs' | 's' | 'm' | 'l' | 'xl';

export interface BreakpointState {
  current: BreakpointSize;
  isXs: boolean;
  isS: boolean;
  isM: boolean;
  isL: boolean;
  isXl: boolean;
  isMobile: boolean;    // xs
  isTablet: boolean;    // s, m
  isDesktop: boolean;   // l, xl
  ltS: boolean;         // less than S (xs only)
  ltM: boolean;         // less than M (xs, s)
  ltL: boolean;         // less than L (xs, s, m)
  gtXs: boolean;        // greater than XS (s, m, l, xl)
  gtS: boolean;         // greater than S (m, l, xl)
  gtM: boolean;         // greater than M (l, xl)
}

@Injectable({
  providedIn: 'root'
})
export class BreakpointService {
  // Custom breakpoint queries matching Material Design
  private readonly breakpointQueries = {
    xs: '(max-width: 599.98px)',
    s: '(min-width: 600px) and (max-width: 959.98px)',
    m: '(min-width: 960px) and (max-width: 1279.98px)',
    l: '(min-width: 1280px) and (max-width: 1919.98px)',
    xl: '(min-width: 1920px)'
  };

  /** Observable that emits current breakpoint state */
  readonly breakpoint$: Observable<BreakpointState>;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpoint$ = this.breakpointObserver
      .observe([
        this.breakpointQueries.xs,
        this.breakpointQueries.s,
        this.breakpointQueries.m,
        this.breakpointQueries.l,
        this.breakpointQueries.xl
      ])
      .pipe(
        map(result => this.mapToBreakpointState(result.breakpoints)),
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  /** Get current breakpoint state synchronously */
  getCurrentBreakpoint(): BreakpointState {
    const breakpoints = {
      [this.breakpointQueries.xs]: this.breakpointObserver.isMatched(this.breakpointQueries.xs),
      [this.breakpointQueries.s]: this.breakpointObserver.isMatched(this.breakpointQueries.s),
      [this.breakpointQueries.m]: this.breakpointObserver.isMatched(this.breakpointQueries.m),
      [this.breakpointQueries.l]: this.breakpointObserver.isMatched(this.breakpointQueries.l),
      [this.breakpointQueries.xl]: this.breakpointObserver.isMatched(this.breakpointQueries.xl)
    };
    return this.mapToBreakpointState(breakpoints);
  }

  /** Check if current viewport matches mobile (xs) */
  isMobile(): boolean {
    return this.breakpointObserver.isMatched(this.breakpointQueries.xs);
  }

  /** Check if current viewport matches tablet (s or m) */
  isTablet(): boolean {
    return this.breakpointObserver.isMatched([this.breakpointQueries.s, this.breakpointQueries.m]);
  }

  /** Check if current viewport matches desktop (l or xl) */
  isDesktop(): boolean {
    return this.breakpointObserver.isMatched([this.breakpointQueries.l, this.breakpointQueries.xl]);
  }

  /** Check if viewport is less than given size */
  isLessThan(size: BreakpointSize): boolean {
    switch (size) {
      case 's': return this.breakpointObserver.isMatched(this.breakpointQueries.xs);
      case 'm': return this.breakpointObserver.isMatched([this.breakpointQueries.xs, this.breakpointQueries.s]);
      case 'l': return this.breakpointObserver.isMatched([this.breakpointQueries.xs, this.breakpointQueries.s, this.breakpointQueries.m]);
      case 'xl': return this.breakpointObserver.isMatched([this.breakpointQueries.xs, this.breakpointQueries.s, this.breakpointQueries.m, this.breakpointQueries.l]);
      default: return false;
    }
  }

  /** Check if viewport is greater than given size */
  isGreaterThan(size: BreakpointSize): boolean {
    switch (size) {
      case 'xs': return this.breakpointObserver.isMatched([this.breakpointQueries.s, this.breakpointQueries.m, this.breakpointQueries.l, this.breakpointQueries.xl]);
      case 's': return this.breakpointObserver.isMatched([this.breakpointQueries.m, this.breakpointQueries.l, this.breakpointQueries.xl]);
      case 'm': return this.breakpointObserver.isMatched([this.breakpointQueries.l, this.breakpointQueries.xl]);
      case 'l': return this.breakpointObserver.isMatched(this.breakpointQueries.xl);
      default: return false;
    }
  }

  private mapToBreakpointState(breakpoints: { [key: string]: boolean }): BreakpointState {
    const isXs = breakpoints[this.breakpointQueries.xs] || false;
    const isS = breakpoints[this.breakpointQueries.s] || false;
    const isM = breakpoints[this.breakpointQueries.m] || false;
    const isL = breakpoints[this.breakpointQueries.l] || false;
    const isXl = breakpoints[this.breakpointQueries.xl] || false;

    let current: BreakpointSize = 'xs';
    if (isXl) current = 'xl';
    else if (isL) current = 'l';
    else if (isM) current = 'm';
    else if (isS) current = 's';

    return {
      current,
      isXs,
      isS,
      isM,
      isL,
      isXl,
      isMobile: isXs,
      isTablet: isS || isM,
      isDesktop: isL || isXl,
      ltS: isXs,
      ltM: isXs || isS,
      ltL: isXs || isS || isM,
      gtXs: isS || isM || isL || isXl,
      gtS: isM || isL || isXl,
      gtM: isL || isXl
    };
  }
}

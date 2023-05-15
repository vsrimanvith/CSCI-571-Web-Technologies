import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventscardComponent } from './eventscard.component';

describe('EventscardComponent', () => {
  let component: EventscardComponent;
  let fixture: ComponentFixture<EventscardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventscardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventscardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

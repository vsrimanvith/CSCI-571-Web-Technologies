import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventstableComponent } from './eventstable.component';

describe('EventstableComponent', () => {
  let component: EventstableComponent;
  let fixture: ComponentFixture<EventstableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventstableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventstableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

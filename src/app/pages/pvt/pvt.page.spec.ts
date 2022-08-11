import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { PvtPage } from './pvt.page';
import { RouterTestingModule } from '@angular/router/testing';

import { ChildrenOutletContexts } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { Storage } from '@ionic/storage-angular';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('PvtPage', () => {
  let component: PvtPage;
  let fixture: ComponentFixture<PvtPage>;
  let angularStorageSpy: jasmine.SpyObj<Storage>;
  beforeEach(() => {
    const spyStorage = jasmine.createSpyObj('Storage', ['create', 'get', 'set']);
    TestBed.configureTestingModule({
      declarations: [ PvtPage ],
      imports: [
        RouterTestingModule,
        IonicModule.forRoot(),

      ],
      providers: [
        {
          provide: Storage,
          useValue: spyStorage
        },
        StatusBar,

        HttpClient,
        HttpHandler,
        HTTP,
        ChildrenOutletContexts,
      ],
    }).compileComponents();

    angularStorageSpy = TestBed.inject(Storage) as jasmine.SpyObj<Storage>;
    fixture = TestBed.createComponent(PvtPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

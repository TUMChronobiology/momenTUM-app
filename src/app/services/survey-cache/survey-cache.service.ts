import { Injectable } from '@angular/core';
import { LoadingService } from '../loading/loading-service.service';
import { File } from '@ionic-native/file/ngx';
import {
  FileDownload,
  FileDownloadResponse,
} from 'capacitor-plugin-filedownload';
import { Filesystem } from '@capacitor/filesystem';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class SurveyCacheService {
  win: any = window;

  mediaToCache: { [id: string]: string } = {};
  videoThumbnailsToCache: object = {};
  localMediaURLs: { [id: string]: string } = {};
  localThumbnailURLs: object = {};
  mediaCount = 0;
  mediaDownloadedCount = 0;

  constructor(
    private file: File,
    private storage: StorageService,
    private loadingService: LoadingService
  ) {}

  /**
   * Downloads a remote file and converts it to a local URL
   *
   * @param url Remote URL to a media file
   */
  async downloadFile(url: string): Promise<string> {
    try {
      // get the fileName from the URL
      const urlSplit = url.split('/');
      const fileName = urlSplit[urlSplit.length - 1];
      const file: FileDownloadResponse = await FileDownload.download({
        uri: url,
        fileName: this.file.dataDirectory + fileName,
      });
      return file.path;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gets all of the remote URLs from the media elements in this study
   *
   * @param study The study protocol
   */
  getMediaURLs(study: Study) {
    // get banner url
    // @ts-ignore
    this.mediaToCache.banner = study.properties.banner_url;

    // get urls from media elements
    for (const module of study.modules) {
      // Must check if the sections exist,
      // they don't for pvt modules
      if (module.sections) {
        for (const section of module.sections) {
          const mediaQuestions = section.questions.filter(
            (question): question is Media => question.type === 'media'
          );
          for (const question of mediaQuestions) {
            this.mediaToCache[question.id] = question.src;
          }
        }
      }
    }
    // set mediaCount to be number of media items
    this.mediaCount = Object.keys(this.mediaToCache).length;
  }

  /**
   * Gets all of the media URLs from the study protocol and downloads the files
   *
   * @param study The study protocol
   */
  async cacheAllMedia(study: Study) {
    this.mediaCount = 0;
    this.mediaDownloadedCount = 0;
    // map media question ids to their urls
    this.getMediaURLs(study);
    await this.downloadAllMedia();
  }

  /**
   * Downloads all of the media items from the remote URLs
   */
  async downloadAllMedia() {
    // download all media items
    const keys = Object.keys(this.mediaToCache);
    for (const key of keys) {
      await this.downloadFile(this.mediaToCache[key]).then((entryURL) => {
        if (
          this.win !== undefined &&
          this.win.Ionic !== undefined &&
          this.win.Ionic.WebView !== undefined
        ) {
          this.localMediaURLs[key] =
            this.win.Ionic.WebView.convertFileSrc(entryURL);
        }
        this.mediaDownloadedCount = this.mediaDownloadedCount + 1;
        this.checkIfFinished();
      });
    }
  }

  /**
   * Checks if all of the media has been downloaded, if so update the protocol
   */
  checkIfFinished() {
    if (this.mediaDownloadedCount === this.mediaCount) {
      this.updateMediaURLsInStudy();
    }
  }

  /**
   * Replaces the remote URLs for media items with the local URLs
   */
  updateMediaURLsInStudy() {
    this.storage.get('current-study').then((studyString: any) => {
      try {
        const studyObject: Study = JSON.parse(studyString);
        // update the banner url first
        // @ts-ignore
        studyObject.properties.banner_url = this.localMediaURLs.banner;

        // update the other media items to the corresponding local URL
        // get urls from media elements
        for (const module of studyObject.modules) {
          if (module.sections) {
            for (const section of module.sections) {
              // Must check if the sections exist,
              // they don't for pvt modules

              const mediaQuestions = section.questions.filter(
                (question): question is Media => question.type === 'media'
              );

              for (const question of mediaQuestions) {
                if (question.id in this.localMediaURLs) {
                  question.src = this.localMediaURLs[question.id];
                }
                if (question.subtype === 'video') {
                  // @ts-ignore
                  question.thumb = this.localMediaURLs.banner;
                }
              }
            }
          }
        }



        // update the study protocol in storage
        this.storage.set('current-study', JSON.stringify(studyObject));
      } catch (e) {
        console.log('Error: ' + e);
      }

      // dismiss the loading spinner
      if (this.loadingService) {
        // Added this condition
        this.loadingService.dismiss();
      }
    });
  }
}

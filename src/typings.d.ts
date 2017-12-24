import Vue from 'vue'
import {SecurityService} from './client/services/Security';

interface JQuery {
	progressbar(options?: any, callback?: Function) : any;
}


declare module 'vue/types/vue' {
  // 3. Declare augmentation for Vue
	interface Vue{
		security: SecurityService;
	}
}

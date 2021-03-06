import { Inject, NgModule, NgModuleFactoryLoader, SystemJsNgModuleLoader } from "@angular/core";
import { BrowserModule, DomSanitizer } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { UIRouterModule } from "@uirouter/angular";
import { NgIdleModule } from "@ng-idle/core";
import { NgIdleKeepaliveModule } from "@ng-idle/keepalive";
import { ActionReducer, ActionReducerMap, MetaReducer, StoreModule } from "@ngrx/store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { storeFreeze } from "ngrx-store-freeze";
import { storeLogger } from "ngrx-store-logger";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatIconRegistry } from "@angular/material";

import {
	STARK_APP_CONFIG,
	STARK_APP_METADATA,
	STARK_MOCK_DATA,
	STARK_SESSION_SERVICE,
	StarkApplicationConfig,
	StarkApplicationConfigImpl,
	StarkApplicationMetadata,
	StarkApplicationMetadataImpl,
	StarkHttpModule,
	StarkLoggingModule,
	StarkMockData,
	StarkRoutingModule,
	StarkSessionModule,
	StarkSessionService,
	StarkUser
} from "@nationalbankbelgium/stark-core";

import { StarkAppLogoModule } from "@nationalbankbelgium/stark-ui";
import { routerConfigFn } from "./router.config";
import { registerMaterialIconSet } from "./material-icons.config";
import { Deserialize } from "cerialize";
/*
 * Translations
 */
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { initializeTranslation } from "./translation.config";
/*
 * Platform and Environment providers/directives/pipes
 */
import { environment } from "../environments/environment";
import { APP_STATES } from "./app.routes";
// App is our top level component
import { AppComponent } from "./app.component";
import { AppState } from "./app.service";
import { HomeComponent } from "./home";
import { AboutComponent } from "./about";
import { NoContentComponent } from "./no-content";

/* tslint:disable:no-import-side-effect */
// load PCSS styles
import "../styles/styles.pcss";
// load SASS styles
import "../styles/styles.scss";
/* tslint:enable */
import "../styles/headings.css";

/**
 * Application wide providers
 */
const APP_PROVIDERS: any[] = [AppState];

// TODO: where to put this factory function?
/**
 * This method will create, configure and return a new StarkApplicationConfig instance
 * @returns the Stark Application config
 */
export function starkAppConfigFactory(): StarkApplicationConfig {
	/**
	 * The needed configuration for the application config
	 */
	const config: any = require("../stark-app-config.json");

	/**
	 * This instance will contain data added by the developer but also data retrieved from the configuration file
	 */
	const applicationConfig: StarkApplicationConfig = Deserialize(config, StarkApplicationConfigImpl);

	applicationConfig.rootStateUrl = "home";
	applicationConfig.rootStateName = "";
	applicationConfig.homeStateName = "home";
	applicationConfig.errorStateName = "";
	applicationConfig.angularDebugInfoEnabled = true; //DEVELOPMENT;
	applicationConfig.debugLoggingEnabled = true; //DEVELOPMENT;
	applicationConfig.routerLoggingEnabled = true; //DEVELOPMENT;

	return applicationConfig;
}

// TODO: where to put this factory function?
/**
 * This method will create, configure and return a new StarkApplicationMetadata instance
 * @returns the Stark Application Metadata
 */
export function starkAppMetadataFactory(): StarkApplicationMetadata {
	/**
	 * The needed configuration for the metadata
	 */
	const metadata: any = require("../stark-app-metadata.json");

	return Deserialize(metadata, StarkApplicationMetadataImpl);
}

// TODO: where to put this factory function?
/**
 *  This method can be used to create and retrieve mock data
 *  @returns StarkMockData
 */
export function starkMockDataFactory(): StarkMockData {
	return {
		whatever: "dummy prop",
		profiles: []
	};
}

/**
 * Application Redux State
 */
export interface State {
	// reducer interfaces
}

/**
 * Reducers configured for a Map of Actions
 */
export const reducers: ActionReducerMap<State> = {
	// reducers
};

/**
 * Logging function from @ngrx/store applications
 */
export function logger(reducer: ActionReducer<State>): any {
	// default, no options
	return storeLogger()(reducer);
}

/**
 * Set of meta-reducer, higher order reducer (i.e., functions)
 */
export const metaReducers: MetaReducer<State>[] = ENV !== "production" ? [logger, storeFreeze] : [];

/**
 * `AppModule` is the main entry point into Angular2's bootstrapping process
 */
@NgModule({
	bootstrap: [AppComponent],
	declarations: [AppComponent, AboutComponent, HomeComponent, NoContentComponent],
	/**
	 * Import Angular's modules.
	 */
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		FormsModule,
		StoreModule.forRoot(reducers, {
			metaReducers
		}),
		// store dev tools instrumentation must be imported AFTER StoreModule
		StoreDevtoolsModule.instrument({
			maxAge: 50, // retains last 50 states
			name: "Stark Starter - NgRx Store DevTools", // shown in the monitor page
			logOnly: environment.production // restrict extension to log-only mode (setting it to false enables all extension features)
		}),
		UIRouterModule.forRoot({
			states: APP_STATES,
			useHash: !Boolean(history.pushState),
			otherwise: { state: "otherwise" },
			config: routerConfigFn
		}),
		TranslateModule.forRoot(),
		NgIdleModule.forRoot(),
		NgIdleKeepaliveModule.forRoot(), // FIXME: disabled in stark-app-config.json for now until json-server is integrated
		StarkHttpModule.forRoot(),
		StarkLoggingModule.forRoot(),
		StarkSessionModule.forRoot(),
		StarkRoutingModule.forRoot(),
		StarkAppLogoModule
	],
	/**
	 * Expose our Services and Providers into Angular's dependency injection.
	 */
	providers: [
		environment.ENV_PROVIDERS,
		APP_PROVIDERS,
		{ provide: NgModuleFactoryLoader, useClass: SystemJsNgModuleLoader }, // needed for ui-router
		{ provide: STARK_APP_CONFIG, useFactory: starkAppConfigFactory },
		{ provide: STARK_APP_METADATA, useFactory: starkAppMetadataFactory },
		{ provide: STARK_MOCK_DATA, useFactory: starkMockDataFactory }
	]
})
/**
 * @ignore
 */
export class AppModule {
	public constructor(
		private translateService: TranslateService,
		@Inject(STARK_SESSION_SERVICE) private sessionService: StarkSessionService,
		matIconRegistry: MatIconRegistry,
		domSanitizer: DomSanitizer
	) {
		initializeTranslation(this.translateService);
		registerMaterialIconSet(matIconRegistry, domSanitizer);

		const user: StarkUser = {
			uuid: "abc123",
			username: "John",
			firstName: "Doe",
			lastName: "Smith",
			roles: ["dummy role"]
		};
		this.sessionService.login(user);
	}
}

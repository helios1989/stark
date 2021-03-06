import { Component, HostBinding, Inject, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { from, Subscription } from "rxjs";
import { MatSidenav, MatSidenavContainer, MatDrawerToggleResult } from "@angular/material/sidenav";
import { STARK_LOGGING_SERVICE, StarkLoggingService } from "@nationalbankbelgium/stark-core";
import { StarkAppSidebarOpenEvent, StarkAppSidebarService, STARK_APP_SIDEBAR_SERVICE } from "../services";

export type StarkAppSidebarLeftMode = "regular" | "menu";

/**
 * Name of the component
 */
const componentName: string = "stark-app-sidebar";

/**
 * Component to display the application's sidebar
 * Only 2 sidebars are allowed: https://github.com/angular/material2/issues/1514
 */
@Component({
	selector: "stark-app-sidebar",
	templateUrl: "./app-sidebar.component.html",
	encapsulation: ViewEncapsulation.None
})
export class StarkAppSidebarComponent implements OnDestroy, OnInit {
	/**
	 * Adds class="stark-app-sidebar" attribute on the host component
	 */
	@HostBinding("class")
	public class: string = componentName;

	/**
	 * Mode for the left sidebar: either the menu is shown or the regular sidebar
	 */
	@Input()
	public sidenavLeftMode: StarkAppSidebarLeftMode;

	/**
	 * Reference to the MatSidenavContainer embedded in this component
	 */
	@ViewChild("appSidenavContainer")
	public appSidenavContainer: MatSidenavContainer;

	/**
	 * Reference to the left MatSidenav embedded in this component
	 */
	@ViewChild("appSidenavLeft")
	public appSidenavLeft: MatSidenav;

	/**
	 * Reference to the right MatSidenav embedded in this component
	 */
	@ViewChild("appSidenavRight")
	public appSidenavRight: MatSidenav;

	/**
	 * Subscription to the open sidebar Observable
	 */
	public openSidebarSubscription: Subscription;

	/**
	 * Subscription to the close sidebar Observable
	 */
	public closeSidebarSubscription: Subscription;

	/**
	 * Class constructor
	 * @param sidebarService - The sidebar service of the application
	 */
	public constructor(
		@Inject(STARK_LOGGING_SERVICE) public logger: StarkLoggingService,
		@Inject(STARK_APP_SIDEBAR_SERVICE) public sidebarService: StarkAppSidebarService
	) {}

	/**
	 * Component lifecycle OnInit hook
	 */
	public ngOnInit(): void {
		this.logger.debug(componentName + ": component initialized");
		this.openSidebarSubscription = this.sidebarService.openSidebar$.subscribe((event: StarkAppSidebarOpenEvent) => {
			this.onOpenSideNav(event);
		});

		this.closeSidebarSubscription = this.sidebarService.closeSidebar$.subscribe(() => {
			this.onCloseSideNavs();
		});
	}

	/**
	 * Component lifecycle OnDestroy hook
	 * Prevent memory leak when component destroyed
	 */
	public ngOnDestroy(): void {
		this.openSidebarSubscription.unsubscribe();
		this.closeSidebarSubscription.unsubscribe();
	}

	/**
	 * Open sidenav handler
	 */
	public onOpenSideNav(event: StarkAppSidebarOpenEvent): void {
		if (event.mode) {
			this.sidenavLeftMode = event.mode;
		}
		switch (event.sidebar) {
			case "left":
				from(this.appSidenavLeft.open()).subscribe(
					(result: MatDrawerToggleResult) => this.logger.debug(componentName + ": left sidenav " + result),
					(error: Error) => this.logger.warn(componentName + ": ", error)
				);
				break;
			case "right":
				from(this.appSidenavRight.open()).subscribe(
					(result: MatDrawerToggleResult) => this.logger.debug(componentName + ": right sidebar " + result),
					(error: Error) => this.logger.warn(componentName + ": ", error)
				);
				break;
			default:
				break;
		}
	}

	/**
	 * Close sidenav handler
	 */
	public onCloseSideNavs(): void {
		this.appSidenavContainer.close();
	}
}

import { Vue, Component,Provide } from 'vue-property-decorator';

@Component({
	template: `
	<!-- sidebar menu -->
	<div id="sidebar-menu" class="main_menu_side hidden-print main_menu">
		<div class="menu_section">
			<h3>General</h3>
			<ul class="nav side-menu">
				<li><a><i class="fa fa-home"></i> Home <span class="fa fa-chevron-down"></span></a>
					<ul class="nav child_menu">
						<li><router-link to="/">Dashboard</router-link></li>
						<li><router-link to="/dashboard-2">Dashboard2</router-link></li>
						<li><a href="index3.html">Dashboard3</a></li>
					</ul>
				</li>
				<li><a><i class="fa fa-edit"></i> Forms <span class="fa fa-chevron-down"></span></a>
					<ul class="nav child_menu">
						<li><a href="form.html">General Form</a></li>
						<li><a href="form_advanced.html">Advanced Components</a></li>
						<li><a href="form_validation.html">Form Validation</a></li>
						<li><a href="form_wizards.html">Form Wizard</a></li>
						<li><a href="form_upload.html">Form Upload</a></li>
						<li><a href="form_buttons.html">Form Buttons</a></li>
					</ul>
				</li>
				<li><a><i class="fa fa-desktop"></i> UI Elements <span class="fa fa-chevron-down"></span></a>
					<ul class="nav child_menu">
						<li><a href="general_elements.html">General Elements</a></li>
						<li><a href="media_gallery.html">Media Gallery</a></li>
						<li><a href="typography.html">Typography</a></li>
						<li><a href="icons.html">Icons</a></li>
						<li><a href="glyphicons.html">Glyphicons</a></li>
						<li><a href="widgets.html">Widgets</a></li>
						<li><a href="invoice.html">Invoice</a></li>
						<li><a href="inbox.html">Inbox</a></li>
						<li><a href="calendar.html">Calendar</a></li>
					</ul>
				</li>
				<li><a><i class="fa fa-table"></i> Tables <span class="fa fa-chevron-down"></span></a>
					<ul class="nav child_menu">
						<li><a href="tables.html">Tables</a></li>
						<li><a href="tables_dynamic.html">Table Dynamic</a></li>
					</ul>
				</li>
				<li><a><i class="fa fa-bar-chart-o"></i> Data Presentation <span class="fa fa-chevron-down"></span></a>
					<ul class="nav child_menu">
						<li><a href="chartjs.html">Chart JS</a></li>
						<li><a href="chartjs2.html">Chart JS2</a></li>
						<li><a href="morisjs.html">Moris JS</a></li>
						<li><a href="echarts.html">ECharts</a></li>
						<li><a href="other_charts.html">Other Charts</a></li>
					</ul>
				</li>
				<li><a><i class="fa fa-clone"></i>Layouts <span class="fa fa-chevron-down"></span></a>
					<ul class="nav child_menu">
						<li><a href="fixed_sidebar.html">Fixed Sidebar</a></li>
						<li><a href="fixed_footer.html">Fixed Footer</a></li>
					</ul>
				</li>
			</ul>
		</div>
		<div class="menu_section">
			<h3>Live On</h3>
			<ul class="nav side-menu">
				<li><a><i class="fa fa-bug"></i> Additional Pages <span class="fa fa-chevron-down"></span></a>
					<ul class="nav child_menu">
						<li><a href="e_commerce.html">E-commerce</a></li>
						<li><a href="projects.html">Projects</a></li>
						<li><a href="project_detail.html">Project Detail</a></li>
						<li><a href="contacts.html">Contacts</a></li>
						<li><a href="profile.html">Profile</a></li>
					</ul>
				</li>
				<li><a><i class="fa fa-windows"></i> Extras <span class="fa fa-chevron-down"></span></a>
					<ul class="nav child_menu">
						<li><a href="page_403.html">403 Error</a></li>
						<li><a href="page_404.html">404 Error</a></li>
						<li><a href="page_500.html">500 Error</a></li>
						<li><a href="plain_page.html">Plain Page</a></li>
						<li><a href="login.html">Login Page</a></li>
						<li><a href="pricing_tables.html">Pricing Tables</a></li>
					</ul>
				</li>
				<li><a><i class="fa fa-sitemap"></i> Multilevel Menu <span class="fa fa-chevron-down"></span></a>
					<ul class="nav child_menu">
						<li><a href="#level1_1">Level One</a>
							<li><a>Level One<span class="fa fa-chevron-down"></span></a>
							<ul class="nav child_menu">
								<li class="sub_menu"><a href="level2.html">Level Two</a>
								</li>
								<li><a href="#level2_1">Level Two</a>
								</li>
								<li><a href="#level2_2">Level Two</a>
								</li>
							</ul>
						</li>
						<li><a href="#level1_2">Level One</a>
						</li>
					</ul>
					</li>
				<li><a href="javascript:void(0)"><i class="fa fa-laptop"></i> Landing Page <span class="label label-success pull-right">Coming Soon</span></a></li>
			</ul>
		</div>
		<!-- /sidebar menu -->
	</div>`
})
export default class SideMenu extends Vue {
	mounted () {
		var
		CURRENT_URL = window.location.href.split('#')[0].split('?')[0],
		$BODY = $('body'),
		$SIDEBAR_MENU = $('#sidebar-menu'),
		$SIDEBAR_FOOTER = $('.sidebar-footer'),
		$LEFT_COL = $('.left_col'),
		$RIGHT_COL = $('.right_col'),
		$NAV_MENU = $('.nav_menu'),
		$FOOTER = $('footer');

		// TODO: This is some kind of easy fix, maybe we can improve this
		function setContentHeight () {
			// reset height
			$RIGHT_COL.css('min-height', $(window).height());

			var bodyHeight = $BODY.outerHeight(),
			footerHeight = $BODY.hasClass('footer_fixed') ? -10 : $FOOTER.height(),
			leftColHeight = $LEFT_COL.eq(1).height() + $SIDEBAR_FOOTER.height(),
			contentHeight = bodyHeight < leftColHeight ? leftColHeight : bodyHeight;

			// normalize content
			contentHeight -= $NAV_MENU.height() + footerHeight;

			$RIGHT_COL.css('min-height', contentHeight);
		};

		$SIDEBAR_MENU.find('a').on('click', function(ev) {
				var $li = $(this).parent();

			if ($li.is('.active')) {
				$li.removeClass('active active-sm');
				$('ul:first', $li).slideUp({
					complete : setContentHeight
				});
			} else {
				// prevent closing menu if we are on child menu
				if (!$li.parent().is('.child_menu')) {
					$SIDEBAR_MENU.find('li').removeClass('active active-sm');
					$SIDEBAR_MENU.find('li ul').slideUp();
				}

				$li.addClass('active');
				$('ul:first', $li).slideDown({
					complete : setContentHeight
				});
			}
		});

		// toggle small or large menu
		this.$root.$on('navigation:menuToggle',function() {
			if ($BODY.hasClass('nav-md')) {
				$SIDEBAR_MENU.find('li.active ul').hide();
				$SIDEBAR_MENU.find('li.active').addClass('active-sm').removeClass('active');
			} else {
				$SIDEBAR_MENU.find('li.active-sm ul').show();
				$SIDEBAR_MENU.find('li.active-sm').addClass('active').removeClass('active-sm');
			}

			$BODY.toggleClass('nav-md nav-sm');

			setContentHeight();

			/*
			$('.dataTable').each ( function () {
				$(this).dataTable().fnDraw();
			});
			*/
		});

		// check active menu
		$SIDEBAR_MENU.find('a[href="' + CURRENT_URL + '"]').parent('li').addClass('current-page');

		$SIDEBAR_MENU.find('a').filter(function () {
			return this.href == CURRENT_URL;
		}).parent('li').addClass('current-page').parents('ul').slideDown({
			complete : setContentHeight
		}).parent().addClass('active');

		// recompute content when resizing
		/*$(window).smartresize({
			complete : setContentHeight
		});*/

		setContentHeight();

		// fixed sidebar
		/*if ($.fn.mCustomScrollbar) {
			$('.menu_fixed').mCustomScrollbar({
				autoHideScrollbar: true,
				theme: 'minimal',
				mouseWheel:{ preventDefault: true }
			});
		}*/

	}
}

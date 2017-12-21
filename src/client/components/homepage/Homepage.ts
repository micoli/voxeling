import { Vue, Component } from 'vue-property-decorator';

import ClosableWidget from '../common/ClosableWidget';
import TitleProgressBar from './TitleProgressBar';
import TitleProgressValue from './TitleProgressValue';
import TitleStatCount from './TitleStatCount';

@Component({
	template: `
	<div class="right_col" role="main">
		<!-- top tiles -->
		<div class="row tile_count">
			<title-stat-count :icon="'fa-user'" :title="'Total Users'" :count="2500" :delta="4"></title-stat-count>
			<title-stat-count :icon="'fa-clock-o'" :title="'Average Time'" :count="132.5" :delta="3"></title-stat-count>
			<title-stat-count :icon="'fa-user'" :title="'Total Males'" :count="2500" :delta="-5"></title-stat-count>
			<title-stat-count :icon="'fa-user'" :title="'Total Females'" :count="1250" :delta="10"></title-stat-count>
			<title-stat-count :icon="'fa-clock-o'" :title="'Total Collections'" :count="98" :delta="20"></title-stat-count>
			<title-stat-count :icon="'fa-user'" :title="'Total Connections'" :count="7654.12" :delta="-15"></title-stat-count>
		</div>
		<!-- /top tiles -->
		<div class="row">
			<div class="col-md-12 col-sm-12 col-xs-12">
				<div class="dashboard_graph">
					<div class="row x_title">
						<div class="col-md-6">
							<h3>Network Activities <small>Graph title sub-title</small></h3>
						</div>
						<div class="col-md-6">
							<div id="reportrange" class="pull-right" style="background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc">
								<i class="glyphicon glyphicon-calendar fa fa-calendar"></i>
								<span>December 30, 2014 - January 28, 2015</span> <b class="caret"></b>
							</div>
						</div>
					</div>
					<div class="col-md-9 col-sm-9 col-xs-12">
						<div id="chart_plot_01" class="demo-placeholder"></div>
					</div>
					<div class="col-md-3 col-sm-3 col-xs-12 bg-white">
						<div class="x_title">
							<h2>Top Campaign Performance</h2>
							<div class="clearfix"></div>
						</div>
						<div class="col-md-12 col-sm-12 col-xs-6">
							<title-progress-bar :title="'Facebook Campaign'" :value="80" :color="'bg-green'"></title-progress-bar>
							<title-progress-bar :title="'Twitter Campaign'" :value="60" :color="'bg-green'"></title-progress-bar>
							<title-progress-bar :title="'Conventional Media'" :value="40" :color="'bg-green'"></title-progress-bar>
							<title-progress-bar :title="'Bill boards'" :value="50" :color="'bg-green'"></title-progress-bar>
						</div>
					</div>
					<div class="clearfix"></div>
				</div>
			</div>
		</div>
		<br />
		<div class="row">
			<closable-widget title="App Versions">
				<h4>App Usage across versions</h4>
				<title-progress-value :width="66" :title="'0.1.5.2'" :value="60" :tvalue="'123k'"></title-progress-value>
				<title-progress-value :width="66" :title="'0.1.5.3'" :value="50" :tvalue="'53k'"></title-progress-value>
				<title-progress-value :width="66" :title="'0.1.5.4'" :value="60" :tvalue="'123k'"></title-progress-value>
				<title-progress-value :width="66" :title="'0.1.5.5'" :value="60" :tvalue="'23k'"></title-progress-value>
				<title-progress-value :width="66" :title="'0.1.5.6'" :value="60" :tvalue="'13k'"></title-progress-value>
			</closable-widget>
			<closable-widget title="Device Usage">
				<table class="" style="width:100%">
					<tr>
						<th style="width:37%;">
							<p>Top 5</p>
						</th>
						<th>
							<div class="col-lg-7 col-md-7 col-sm-7 col-xs-7">
								<p class="">Device</p>
							</div>
							<div class="col-lg-5 col-md-5 col-sm-5 col-xs-5">
								<p class="">Progress</p>
							</div>
						</th>
					</tr>
					<tr>
						<td>
							<canvas class="canvasDoughnut" height="140" width="140" style="margin: 15px 10px 10px 0"></canvas>
						</td>
						<td>
							<table class="tile_info">
								<tr>
									<td>
										<p><i class="fa fa-square blue"></i>IOS </p>
									</td>
									<td>30%</td>
								</tr>
								<tr>
									<td>
										<p><i class="fa fa-square green"></i>Android </p>
									</td>
									<td>10%</td>
								</tr>
								<tr>
									<td>
										<p><i class="fa fa-square purple"></i>Blackberry </p>
									</td>
									<td>20%</td>
								</tr>
								<tr>
									<td>
										<p><i class="fa fa-square aero"></i>Symbian </p>
									</td>
									<td>15%</td>
								</tr>
								<tr>
									<td>
										<p><i class="fa fa-square red"></i>Others </p>
									</td>
									<td>30%</td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
			</closable-widget>
			<closable-widget title="Quick Settings">
				<div class="dashboard-widget-content">
					<ul class="quick-list">
						<li><i class="fa fa-calendar-o"></i><a href="#">Settings</a>
						</li>
						<li><i class="fa fa-bars"></i><a href="#">Subscription</a>
						</li>
						<li><i class="fa fa-bar-chart"></i><a href="#">Auto Renewal</a> </li>
						<li><i class="fa fa-line-chart"></i><a href="#">Achievements</a>
						</li>
						<li><i class="fa fa-bar-chart"></i><a href="#">Auto Renewal</a> </li>
						<li><i class="fa fa-line-chart"></i><a href="#">Achievements</a>
						</li>
						<li><i class="fa fa-area-chart"></i><a href="#">Logout</a>
						</li>
					</ul>
					<div class="sidebar-widget">
						<h4>Profile Completion</h4>
						<canvas width="150" height="80" id="chart_gauge_01" class="" style="width: 160px; height: 100px;"></canvas>
						<div class="goal-wrapper">
							<span id="gauge-text" class="gauge-value pull-left">0</span>
							<span class="gauge-value pull-left">%</span>
							<span id="goal-text" class="goal-value pull-right">100%</span>
						</div>
					</div>
				</div>
			</closable-widget>
		</div>
		<div class="row">
			<closable-widget title="Recent Activities <small>Sessions</small>" size="col-md-4 col-sm-4 col-xs-12" height-class="fixed_height_320 overflow_hidden">
				<div class="dashboard-widget-content">
					<ul class="list-unstyled timeline widget">
						<li>
							<div class="block">
								<div class="block_content">
									<h2 class="title">
										<a>Who Needs Sundance When You’ve Got&nbsp;Crowdfunding?</a>
									</h2>
									<div class="byline">
										<span>13 hours ago</span> by <a>Jane Smith</a>
									</div>
									<p class="excerpt">Film festivals used to be do-or-die moments for movie makers. They were where you met the producers that could fund your project, and if the buyers liked your flick, they’d pay to Fast-forward and… <a>Read&nbsp;More</a>
									</p>
								</div>
							</div>
						</li>
						<li>
							<div class="block">
								<div class="block_content">
									<h2 class="title">
										<a>Who Needs Sundance When You’ve Got&nbsp;Crowdfunding?</a>
									</h2>
									<div class="byline">
										<span>13 hours ago</span> by <a>Jane Smith</a>
									</div>
									<p class="excerpt">Film festivals used to be do-or-die moments for movie makers. They were where you met the producers that could fund your project, and if the buyers liked your flick, they’d pay to Fast-forward and… <a>Read&nbsp;More</a>
									</p>
								</div>
							</div>
						</li>
						<li>
							<div class="block">
								<div class="block_content">
									<h2 class="title">
										<a>Who Needs Sundance When You’ve Got&nbsp;Crowdfunding?</a>
									</h2>
									<div class="byline">
										<span>13 hours ago</span> by <a>Jane Smith</a>
									</div>
									<p class="excerpt">Film festivals used to be do-or-die moments for movie makers. They were where you met the producers that could fund your project, and if the buyers liked your flick, they’d pay to Fast-forward and… <a>Read&nbsp;More</a>
									</p>
								</div>
							</div>
						</li>
						<li>
							<div class="block">
								<div class="block_content">
									<h2 class="title">
										<a>Who Needs Sundance When You’ve Got&nbsp;Crowdfunding?</a>
									</h2>
									<div class="byline">
										<span>13 hours ago</span> by <a>Jane Smith</a>
									</div>
									<p class="excerpt">Film festivals used to be do-or-die moments for movie makers. They were where you met the producers that could fund your project, and if the buyers liked your flick, they’d pay to Fast-forward and… <a>Read&nbsp;More</a>
									</p>
								</div>
							</div>
						</li>
					</ul>
				</div>
			</closable-widget>
			<closable-widget title="Visitors location <small>geo-presentation</small>" size="col-md-8 col-sm-8 col-xs-12">
				<div class="dashboard-widget-content">
					<div class="col-md-4 hidden-small">
						<h2 class="line_30">125.7k Views from 60 countries</h2>
						<table class="countries_list">
							<tbody>
								<tr>
									<td>United States</td>
									<td class="fs15 fw700 text-right">33%</td>
								</tr>
								<tr>
									<td>France</td>
									<td class="fs15 fw700 text-right">27%</td>
								</tr>
								<tr>
									<td>Germany</td>
									<td class="fs15 fw700 text-right">16%</td>
								</tr>
								<tr>
									<td>Spain</td>
									<td class="fs15 fw700 text-right">11%</td>
								</tr>
								<tr>
									<td>Britain</td>
									<td class="fs15 fw700 text-right">10%</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div id="world-map-gdp" class="col-md-8 col-sm-12 col-xs-12" style="height:230px;"></div>
				</div>
			</closable-widget>
		</div>
		<div class="row">
			<closable-widget title="To Do List <small>Sample tasks</small>" size="col-md-6 col-sm-6 col-xs-12">
				<div class="">
					<ul class="to_do">
						<li><p><input type="checkbox" class="flat"> Schedule meeting with new client </p></li>
						<li><p><input type="checkbox" class="flat"> Create email address for new intern</p></li>
						<li><p><input type="checkbox" class="flat"> Have IT fix the network printer</p></li>
						<li><p><input type="checkbox" class="flat"> Copy backups to offsite location</p></li>
						<li><p><input type="checkbox" class="flat"> Food truck fixie locavors mcsweeney</p></li>
						<li><p><input type="checkbox" class="flat"> Food truck fixie locavors mcsweeney</p></li>
						<li><p><input type="checkbox" class="flat"> Create email address for new intern</p></li>
						<li><p><input type="checkbox" class="flat"> Have IT fix the network printer</p></li>
						<li><p><input type="checkbox" class="flat"> Copy backups to offsite location</p></li>
					</ul>
				</div>
				<!-- End to do list -->
			</closable-widget>
			<closable-widget title="Daily active users <small>Sessions</small>" size="col-md-6 col-sm-6 col-xs-12">
				<div class="row">
					<div class="col-sm-12">
						<div class="temperature"><b>Monday</b>, 07:30 AM
							<span>F</span>
							<span><b>C</b></span>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="col-sm-4">
						<div class="weather-icon">
							<canvas height="84" width="84" id="partly-cloudy-day"></canvas>
						</div>
					</div>
					<div class="col-sm-8">
						<div class="weather-text">
							<h2>Texas <br><i>Partly Cloudy Day</i></h2>
						</div>
					</div>
				</div>
				<div class="col-sm-12">
					<div class="weather-text pull-right">
						<h3 class="degrees">23</h3>
					</div>
				</div>
				<div class="clearfix"></div>
				<div class="row weather-days">
					<div class="col-sm-2">
						<div class="daily-weather">
							<h2 class="day">Mon</h2>
							<h3 class="degrees">25</h3>
							<canvas id="clear-day" width="32" height="32"></canvas>
							<h5>15 <i>km/h</i></h5>
						</div>
					</div>
					<div class="col-sm-2">
						<div class="daily-weather">
							<h2 class="day">Tue</h2>
							<h3 class="degrees">25</h3>
							<canvas height="32" width="32" id="rain"></canvas>
							<h5>12 <i>km/h</i></h5>
						</div>
					</div>
					<div class="col-sm-2">
						<div class="daily-weather">
							<h2 class="day">Wed</h2>
							<h3 class="degrees">27</h3>
							<canvas height="32" width="32" id="snow"></canvas>
							<h5>14 <i>km/h</i></h5>
						</div>
					</div>
					<div class="col-sm-2">
						<div class="daily-weather">
							<h2 class="day">Thu</h2>
							<h3 class="degrees">28</h3>
							<canvas height="32" width="32" id="sleet"></canvas>
							<h5>15 <i>km/h</i></h5>
						</div>
					</div>
					<div class="col-sm-2">
						<div class="daily-weather">
							<h2 class="day">Fri</h2>
							<h3 class="degrees">28</h3>
							<canvas height="32" width="32" id="wind"></canvas>
							<h5>11 <i>km/h</i></h5>
						</div>
					</div>
					<div class="col-sm-2">
						<div class="daily-weather">
							<h2 class="day">Sat</h2>
							<h3 class="degrees">26</h3>
							<canvas height="32" width="32" id="cloudy"></canvas>
							<h5>10 <i>km/h</i></h5>
						</div>
					</div>
					<div class="clearfix"></div>
				</div>
				<!-- end of weather widget -->
			</closable-widget>
		</div>
	</div>`,
	components:{
		ClosableWidget:ClosableWidget,
		TitleProgressBar:TitleProgressBar,
		TitleProgressValue:TitleProgressValue,
		TitleStatCount:TitleStatCount
	}
})
export default class Homepage extends Vue {
	mounted () {
	}

	destroyed () {
	}
}

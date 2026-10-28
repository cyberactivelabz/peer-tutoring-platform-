import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TutoringService } from '../services/tutoring.service';
import { CreateSessionDto } from '../dto/create-session.dto';
import { UpdateSessionStatusDto } from '../dto/update-session-status.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';

@ApiTags('Tutoring Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tutoring')
export class TutoringController {
  constructor(private readonly tutoringService: TutoringService) {}

  @Post('book')
  @ApiOperation({ summary: 'Book a 1-on-1 or group tutoring session' })
  @ApiResponse({ status: 201, description: 'Tutoring session successfully booked' })
  async bookSession(@CurrentUser() user: User, @Body() dto: CreateSessionDto) {
    return this.tutoringService.bookSession(user.id, dto);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join an open group tutoring session' })
  @ApiResponse({ status: 200, description: 'Joined group session successfully' })
  async joinGroupSession(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('notes') notes?: string,
  ) {
    return this.tutoringService.joinGroupSession(user.id, id, notes);
  }

  @Get('my-sessions')
  @ApiOperation({ summary: 'Retrieve all tutoring sessions where user is tutor or learner' })
  @ApiResponse({ status: 200, description: 'List of tutoring sessions' })
  async getMySessions(@CurrentUser() user: User) {
    return this.tutoringService.getMySessions(user.id);
  }

  @Get('group/open')
  @ApiOperation({ summary: 'List all open upcoming group tutoring sessions' })
  @ApiQuery({ name: 'courseId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of open group sessions' })
  async getOpenGroupSessions(@Query('courseId') courseId?: string) {
    return this.tutoringService.getOpenGroupSessions(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific tutoring session' })
  @ApiResponse({ status: 200, description: 'Session details' })
  async getSessionById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.tutoringService.getSessionById(id, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update session status (CONFIRMED, COMPLETED, CANCELLED)' })
  @ApiResponse({ status: 200, description: 'Session status updated' })
  async updateStatus(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSessionStatusDto,
  ) {
    return this.tutoringService.updateStatus(user.id, id, dto);
  }
}

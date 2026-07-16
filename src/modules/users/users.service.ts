import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { AccessTokenPayload } from 'src/common/interfaces/token-payload.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly i18n: I18nService,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async create(
    data: Pick<User, 'name' | 'email' | 'password'> &
      Partial<Pick<User, 'role'>>,
  ): Promise<User> {
    const emailExists = await this.userRepository.exists({
      where: { email: data.email },
    });

    if (emailExists) {
      throw new ConflictException(this.i18n.t('users.error.userExists'));
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = this.userRepository.create({
      ...data,
      password: passwordHash,
    });

    return this.userRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findOneOrFail(id: number): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException(this.i18n.t('users.error.notFound'));
    }

    return user;
  }

  findByIdWithRefreshTokenHash(userId: number): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.refreshTokenHash')
      .where('user.id = :userId', {
        userId,
      })
      .getOne();
  }

  async updateRefreshTokenHash(
    userId: number,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      refreshTokenHash,
    });
  }

  async update(
    id: number,
    currentUser: AccessTokenPayload,
    dto: UpdateUserDto,
  ): Promise<User> {
    const isAdmin = currentUser.role === 'admin';
    const isSelf = currentUser.sub === id;

    if (!isSelf && !isAdmin) {
      throw new ForbiddenException(this.i18n.t('users.error.forbidden'));
    }

    const user = await this.findOneOrFail(id);

    if (dto.name) {
      user.name = dto.name;
    }

    if (isAdmin && dto.role) {
      user.role = dto.role;
    }

    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(this.i18n.t('users.error.notFound'));
    }
  }
}

import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

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

  async create(data: Pick<User, 'name' | 'email' | 'password'>): Promise<User> {
    const user = this.userRepository.create(data);

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      const existingUser = await this.findByEmail(data.email);

      if (existingUser) {
        throw new ConflictException(this.i18n.t('users.error.userExists'));
      }

      throw error;
    }
  }

  findById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
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
}
